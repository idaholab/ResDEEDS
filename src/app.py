from types import SimpleNamespace
import werkzeug
from flask import Flask, render_template, g, send_file, url_for, request, redirect, session
import asyncio
from config import config
from backend import DBSession
from backend.project import *
import logging
import os
import platform

logging.basicConfig(level=logging.DEBUG if config['debug_mode'] else logging.INFO)

if platform.system()=='Windows':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

ALLOWED_EXTENSIONS = { 'xlsx', 'xls', 'csv' }
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

app = Flask(__name__)

app.secret_key = config['app_secret_key']
os.environ["NEMO_PRINT_BANNER"]= "false"

#initialize okta
USE_OKTA = config['use_okta']
if USE_OKTA:
    from flask_oidc import OpenIDConnect
    from okta.client import Client as UsersClient
    app.config["OIDC_CLIENT_SECRETS"] = "config/client_secrets.json"
    app.config["OIDC_COOKIE_SECURE"] = False
    app.config["OIDC_CALLBACK_ROUTE"] = "/oidc/callback"
    app.config["OIDC_SCOPES"] = ["openid", "email", "profile"]
    app.config["OIDC_ID_TOKEN_COOKIE_NAME"] = "oidc_token"
    oidc = OpenIDConnect(app)
    okta_client = UsersClient(config["okta"])

PROJECT_ID_KEY = "project_id"

hazard_risk_colors = ['#9fff8c', '#FFEE90', '#FFD27E', '#FFA482']

@app.before_request
def before_request():
    g.__setattr__('db_session', DBSession())
    if PROJECT_ID_KEY in session:
        g.__setattr__('project', Project.get_by_id(g.db_session, session[PROJECT_ID_KEY]))
    else:
        g.__setattr__('project', None)

    g.__setattr__('spine_db_session', SpineDBSession())

    if USE_OKTA and oidc.user_loggedin:
        async def _f():
            user, _, _ = await okta_client.get_user(oidc.user_getfield("sub"))
            # https://developer.okta.com/docs/reference/api/users/#example
            g.__setattr__('user', user)
        asyncio.run(_f())
    elif USE_OKTA:
        logging.info('User is not logged in!')
        g.__setattr__('user', None)
    else:
        logging.warning('Operating in unauthenticated mode.')
        user = SimpleNamespace()
        user.use_okta = False
        user.id = 'default'
        g.__setattr__('user', user)

@app.after_request
def after_request(response):
    g.db_session.commit()
    g.spine_db_session.commit()
    return response

@app.route('/', methods=["GET", "POST"])
def index():
    projects = []
    if g.user is not None:
        projects = Project.get_all_for_user(g.db_session, g.user.id)
    else:
        logging.debug("Anonymous user.")
    if request.method == "POST":
        if len(projects) == 0 or request.form["projNameValAdd"] != "":
            if len(projects) > 0:
                sys_name = request.form["projNameValAdd"]
            else:
                sys_name = request.form["projNameVal"]
            project = Project.build(g.db_session, g.spine_db_session, sys_name, g.user.id)
            session[PROJECT_ID_KEY] = project.id
        else:
            try:
                # grabs id of whatever project's "edit" was clicked
                session[PROJECT_ID_KEY] = request.form["edit"]
            except werkzeug.exceptions.BadRequestKeyError:
                Project.get_by_id(g.db_session, request.form["delete"]).delete(g.db_session)
                return redirect("/")

        return redirect("/qualities")
    return render_template("base.html", projects=projects)

@app.route('/qualities', methods=["GET", "POST"])
def qualities():
    result = ""
    if request.method == "POST":
        if 'system_spreadsheet' in request.files:
            file = request.files['system_spreadsheet']
            if allowed_file(file.filename):
                try:
                    result = g.project.import_system(g.db_session, g.spine_db_session, file, is_baseline=True)
                except Exception as exception: #pylint: disable=W0718
                    logging.exception(exception)
                    return render_template("qualities.html", result=[], errors=["ERROR: unable to import system!"]), 500

            else:
                logging.info(f'{file.filename} not allowed.')
        else:
            logging.info('Did not find system_spreadsheet in posted files.')
    return render_template("qualities.html", result=result)

@app.route('/download-template', methods=["GET"])
def download_template():
    path = Project.get_template_file_path()
    return send_file(path, as_attachment=True)

@app.route('/initial-system', methods=["GET"])
def initial_system():
    sys, rels = g.project.get_system(g.spine_db_session, baseline=True)
    logging.debug(f'Sys: {sys}')
    return render_template("initial-system.html", system=sys, relationships=rels)

@app.route('/hazards', methods=["GET", "POST"])
def hazards():
    if request.method == "POST":
        for hazard in g.project.hazards:
            hazard.impact = HazardImpact.UNKNOWN
            hazard.likelihood = HazardLikelihood.UNKNOWN
        
        logging.debug(request.form)
        for impact_likelihood, hazard_string in request.form.items():
            for hazard in g.project.hazards:
                if hazard.name == hazard_string:
                    impact, likelihood = impact_likelihood.split('_')
                    hazard.impact = HazardImpact(impact)
                    hazard.likelihood = HazardLikelihood(likelihood)

        return redirect("/goals")
    return render_template("hazards.html", hazards=g.project.get_hazards())

@app.route('/goals', methods=["GET", "POST"])
def goals():
    if request.method == "POST":
        goal_names = request.form.getlist('goalName')
        goal_comparisons = request.form.getlist('goalComparison')
        goal_target_values = request.form.getlist('goalTargetValue')

        print(goal_names, goal_comparisons, goal_target_values)

        for n, c, tv in zip(goal_names, goal_comparisons, goal_target_values):
            hazard_name, goal_name = n.split('.')
            try:
                g.project.update_goal(g.db_session, hazard_name, goal_name, c, float(tv))
            except ValueError:
                print(f'Could not convert {tv} to float for goal {n}.')

        return redirect("/spineopt")
    return render_template("goals.html", base_hazard=g.project.get_base_hazard(), hazards=sorted(g.project.get_hazards(), reverse=True, key=lambda x: x.get_risk_level().value), goal_comparisons=GoalComparison.get_all(), colors=hazard_risk_colors)

@app.route('/spineopt', methods=["GET", "POST"])
def spineopt():
    sys, rels = g.project.get_system(g.spine_db_session)
    logging.debug(request)
    if request.method == "POST":
        # Update system objects
        if 'system_spreadsheet' in request.files and request.files['system_spreadsheet'].filename:
            print('Importing spreadsheet, ignoring manual entries.')
            file = request.files['system_spreadsheet']
            if allowed_file(file.filename):
                g.project.import_system(g.db_session, g.spine_db_session, file, is_baseline=False)
                sys, rels = g.project.get_system(g.spine_db_session)
                logging.debug(sys)
            else:
                print(f'{file.filename} not allowed.')
        else:
            print('Doing GUI parameter updates.')
            for k, v in request.form.items():
                words = k.split('.')
                if words[0] == 'obj':
                    obj_id = words[1]
                    param_name = words[2]
                    g.project.update_object_parameter(g.spine_db_session, int(obj_id), param_name, v)
                elif words[0] == 'rel':
                    if words[1] == 'obj':
                        rel_id = words[2]
                        obj_index = words[3]
                        g.project.update_relationship_object(g.spine_db_session, int(rel_id), int(obj_index), v)
    return render_template("spineopt.html", system=sys, relationships=rels)

@app.route('/run-spineopt', methods=["GET"])
def run_spineopt():
    spine_output = g.project.run_spineopt()
    session["spine_output"] = spine_output
    print(type(session["spine_output"]))
    g.project.load_results(g.spine_db_session)
    return redirect("/results")

@app.route('/results', methods=["GET"])
def results():
    return render_template("results.html", base_hazard=g.project.get_base_hazard(), hazards=sorted(g.project.get_hazards(), reverse=True, key=lambda x: x.get_risk_level().value), goal_comparisons=GoalComparison.get_all(), colors=hazard_risk_colors)

@app.route('/changes', methods=["GET"])
def changes():
    added, removed, changed = g.project.calculate_proposed_changes(g.spine_db_session)
    return render_template("changes.html", added=added, removed=removed, changed=changed)

if USE_OKTA:
    @app.route("/login")
    @oidc.require_login
    def login():
        return redirect(url_for("index"))

    @app.route("/logout")
    def logout():
        oidc.logout()
        return redirect(url_for("index"))

if __name__ == '__main__':
    app.run(debug=config['debug_mode'])
