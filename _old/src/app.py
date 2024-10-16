# Copyright 2023, Battelle Energy Alliance, LLC
from types import SimpleNamespace
import logging
import os
import platform
import asyncio
import werkzeug
from flask import (
    Flask,
    render_template,
    g,
    send_file,
    url_for,
    request,
    redirect,
    session,
)

from config import config
from backend import DBSession
from backend.project import Project, HazardImpact, HazardLikelihood, GoalComparison
from backend.spine.db import SpineDBSession

if platform.system() == "Windows":
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())

ALLOWED_EXTENSIONS = {"xlsx", "xls", "csv"}


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


app = Flask(__name__)

app.secret_key = config["app_secret_key"]
os.environ["NEMO_PRINT_BANNER"] = "false"

PROJECT_ID_KEY = "project_id"

hazard_risk_colors = ["#9fff8c", "#FFEE90", "#FFD27E", "#FFA482"]


@app.before_request
def before_request():
    g.db_session = DBSession()
    if PROJECT_ID_KEY in session:
        g.project = Project.get_by_id(g.db_session, session[PROJECT_ID_KEY])
    else:
        g.project = None

    g.spine_db_session = SpineDBSession()
    logging.info("Operating in unauthenticated mode.")
    user = SimpleNamespace()
    user.id = "default"
    g.user = user


@app.after_request
def after_request(response):
    g.db_session.commit()
    g.spine_db_session.commit()
    return response


@app.route("/", methods=["GET", "POST"])
def index():
    projects = []
    if g.user is not None:
        projects = Project.get_all_for_user(g.db_session, g.user.id)
    else:
        logging.debug("Anonymous user.")
    logging.debug(request.form)
    if request.method == "POST":
        if len(projects) == 0 or request.form["projNameValAdd"] != "":
            if len(projects) > 0:
                sys_name = request.form["projNameValAdd"]
            else:
                sys_name = request.form["projNameVal"]
            project = Project.build(g.db_session, sys_name, g.user.id)
            session[PROJECT_ID_KEY] = project.id
        else:
            try:
                # Grabs id of whatever project's "edit" was clicked
                session[PROJECT_ID_KEY] = request.form["edit"]
            except werkzeug.exceptions.BadRequestKeyError:
                Project.get_by_id(g.db_session, request.form["delete"]).delete(
                    g.db_session
                )
                return redirect("/")

        return redirect("/qualities")
    return render_template("base.html", projects=projects)


@app.route("/qualities", methods=["GET", "POST"])
def qualities():
    result = ""
    if request.method == "POST":
        if "system_spreadsheet" in request.files:
            file = request.files["system_spreadsheet"]
            if allowed_file(file.filename):
                try:
                    g.project.import_system(
                        g.db_session, g.spine_db_session, file, is_baseline=True
                    )
                    result = "System imported."
                except Exception as exception:  # pylint: disable=W0718
                    logging.exception(exception)
                    return (
                        render_template(
                            "qualities.html",
                            result=[],
                            errors=["ERROR: unable to import system!"],
                        ),
                        500,
                    )

            else:
                logging.error(
                    "Tried to upload a file %s but this file type is not allowed.",
                    file.filename,
                )
        else:
            logging.error("Did not find system_spreadsheet in posted files.")
    return render_template("qualities.html", result=result)


@app.route("/download-template", methods=["GET"])
def download_template():
    path = Project.get_template_file_path()
    return send_file(path, as_attachment=True)


@app.route("/initial-system", methods=["GET"])
def initial_system():
    sys, rels = g.project.get_system(g.spine_db_session, baseline=True)
    return render_template("initial-system.html", system=sys, relationships=rels)


@app.route("/hazards", methods=["GET", "POST"])
def hazards():
    if request.method == "POST":
        for hazard in g.project.hazards:
            hazard.impact = HazardImpact.UNKNOWN
            hazard.likelihood = HazardLikelihood.UNKNOWN

        logging.debug(request.form)
        for impact_likelihood, hazard_string in request.form.items():
            for hazard in g.project.hazards:
                if hazard.name == hazard_string:
                    impact, likelihood = impact_likelihood.split("_")
                    hazard.impact = HazardImpact(impact)
                    hazard.likelihood = HazardLikelihood(likelihood)

        return redirect("/goals")
    return render_template("hazards.html", hazards=g.project.get_hazards())


@app.route("/goals", methods=["GET", "POST"])
def goals():
    if request.method == "POST":
        goal_names = request.form.getlist("goalName")
        goal_comparisons = request.form.getlist("goalComparison")
        goal_target_values = request.form.getlist("goalTargetValue")

        for n, c, tv in zip(goal_names, goal_comparisons, goal_target_values):
            hazard_name, goal_name = n.split(".")
            try:
                g.project.update_goal(
                    g.db_session, hazard_name, goal_name, c, float(tv)
                )
            except ValueError as err:
                logging.exception(
                    "Could not convert %s to float for goal %s.", str(tv), n
                )
                logging.exception(err)

        return redirect("/spineopt")
    return render_template(
        "goals.html",
        base_hazard=g.project.get_base_hazard(),
        hazards=sorted(
            g.project.get_hazards(),
            reverse=True,
            key=lambda x: x.get_risk_level().value,
        ),
        goal_comparisons=GoalComparison.get_all(),
        colors=hazard_risk_colors,
    )


@app.route("/spineopt", methods=["GET", "POST"])
def spineopt():
    sys, rels = g.project.get_system(g.spine_db_session)
    logging.debug(request)
    if request.method == "POST":
        # Update system objects
        if (
            "system_spreadsheet" in request.files
            and request.files["system_spreadsheet"].filename
        ):
            logging.warning("Importing spreadsheet, ignoring manual entries.")
            file = request.files["system_spreadsheet"]
            if allowed_file(file.filename):
                g.project.import_system(
                    g.db_session, g.spine_db_session, file, is_baseline=False
                )
                sys, rels = g.project.get_system(g.spine_db_session)
                logging.debug(sys)
            else:
                logging.error(
                    "Tried to upload a file %s but this file type is not allowed.",
                    file.filename,
                )
        else:
            logging.info("Doing GUI parameter updates.")
            for k, v in request.form.items():
                words = k.split(".")
                if words[0] == "obj":
                    obj_id = words[1]
                    param_name = words[2]
                    g.project.update_object_parameter(
                        g.spine_db_session, int(obj_id), param_name, v
                    )
                elif words[0] == "rel":
                    if words[1] == "obj":
                        rel_id = words[2]
                        obj_index = words[3]
                        g.project.update_relationship_object(
                            g.spine_db_session, int(rel_id), int(obj_index), v
                        )
    return render_template("spineopt.html", system=sys, relationships=rels)


@app.route("/run-spineopt", methods=["GET"])
def run_spineopt():
    spine_output = g.project.run_spineopt()
    session["spine_output"] = spine_output
    logging.info(type(session["spine_output"]))
    g.project.load_results(g.spine_db_session)
    return redirect("/results")


@app.route("/results", methods=["GET"])
def results():
    g.project.load_results(g.spine_db_session, baseline=False)
    g.project.load_results(g.spine_db_session, baseline=True)
    return render_template(
        "results.html",
        base_hazard=g.project.get_base_hazard(),
        hazards=sorted(
            g.project.get_hazards(),
            reverse=True,
            key=lambda x: x.get_risk_level().value,
        ),
        goal_comparisons=GoalComparison.get_all(),
        colors=hazard_risk_colors,
    )


@app.route("/changes", methods=["GET"])
def changes():
    added, removed, changed = g.project.calculate_proposed_changes(g.spine_db_session)
    return render_template(
        "changes.html", added=added, removed=removed, changed=changed
    )


@app.route("/login")
def login():
    return redirect(url_for("index"))


@app.route("/logout")
def logout():
    return redirect(url_for("index"))


if __name__ == "__main__":
    app.run(debug=config["debug_mode"])
