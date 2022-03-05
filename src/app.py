from flask import Flask, render_template, g, url_for, request, redirect
from matplotlib.font_manager import json_load
from werkzeug.utils import redirect
from flask_oidc import OpenIDConnect
#from okta import UsersClient
from backend import db
from flask_sqlalchemy import SQLAlchemy
from backend.impact import ImpactType, Impact
from backend.system import SpineSystem, System
from backend.hazard import Hazard, HazardToHazardLink, HazardType, HazardToImpactLink
import json

with open("config.json", "r") as config_file:
    config = json.load(config_file)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql://{config["database"]["db_user"]}:{config["database"]["db_pass"]}@localhost/{config["database"]["db_name"]}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

if config["database"]["drop_and_recreate"]:
    with app.app_context():
        db.drop_all()
        db.create_all()
        system = SpineSystem(name='Test Spine system', spine_dir="")
        db.session.add(system)
        system = System(name='Test base system')
        db.session.add(system)
        impact = Impact(name='Test impact', type=ImpactType.SUBSTATIONS, severity=0.75)
        db.session.add(impact)
        hazard = Hazard(is_template=True, name='Test template hazard', type=HazardType.RANSOMWARE, impacts=[impact])
        db.session.add(hazard)
        link = HazardToHazardLink(this_type=HazardType.RANSOMWARE, that_type=HazardType.DENIAL_OF_SERVICE)
        db.session.add(link)
        link = HazardToImpactLink(this_type=HazardType.RANSOMWARE, that_type=ImpactType.SUBSTATIONS)
        db.session.add(link)

        db.session.commit()

        for h in Hazard.templates():
            print(h.name)

        for t in HazardToHazardLink.all_for_type(HazardType.RANSOMWARE):
            print(t)
            

#initialize okta
app.config["OIDC_CLIENT_SECRETS"] = "client_secrets.json"
app.config["OIDC_COOKIE_SECURE"] = False
app.config["OIDC_CALLBACK_ROUTE"] = "/oidc/callback"
app.config["OIDC_SCOPES"] = ["openid", "email", "profile"]
app.secret_key = "f46cBXvh34ovp1lxCmfE"
app.config["OIDC_ID_TOKEN_COOKIE_NAME"] = "oidc_token"
oidc = OpenIDConnect(app)
okta_client = None#UsersClient("dev-53761026.okta.com", "00nJcCJMZXtOWmdloatdx_SzvIwmRDi3LalZFeh6DG")

# gloabal variables
generation_types = ["Diesel Generator", "Wind", "Solar"]
load_types = ["Commercial", "Single Home", "Community Residential"]
physical_hazards = ["Hurricanes", "High Wind", "Lightning Storms", "Fires", "Deep Freezes", "Ice", "Floods", 
                    "Earthquakes", "Geomagnetic Disturbances", "Vandalism", "Substation Attacks", "Fuel Shortage", "Severe Winter Weather"]
cyber_hazards = ["Ransomware", "APT (Advanced Persistent Threats)", "Insider Threats", "Communication Outages", 
                 "Denial of Service"]
inputs_metrics = ["Energy feedstock", "Energy not supplied", "Energy storage", "Generators available", 
"Key replacement equipment stockpile", "Redundant power lines", "Reinforced concrete vs wood", "Siting infrastructures",
"Underground, overhead, & undersea lines", "Unique encrypted passwords for utility smart distribution", "Workers employed",
"Hydrophobic coating on equipment", "Distribution poles", "Number of transmission lines available", "Hierarchical levels"]
capacity_metrics = ["Comm. & control systems", "Electrical protection and metering", "Flow paths, line flow limits",
"Generation/load bus distribution", "Reserve/spare capacity", "Functional zones", "Substations, overhead lines, underground cables",
"Hierarchical level(I, II, III)", "Operator training", "Mutual assistant agreements", "Transformers", "Tree trimming metrics"]
capabilities_metrics = ["Ancillary service", "Hazard rate relating function", "Line mitigation", "Load biasing", "Net-ability",
"Path redundancy", "Protective and switching devices", "Viability of investments", "Adequacy", "Congestion control"]
performance_metrics = ["Coefficient of variation of the frequency index of sags", "Control performance", "Standard 2 violations",
"Bulk electric system reliability performance indices", "Derated power", "Dropped/lost phase", "Edge resilience trajectory",
"Energy efficiency/intensity", "Failure rate", "Harmonic distortions", "Overhead and underground line segments", "Peak to peak voltage",
"Phase imbalance", "Protective switching devices", "Rapid voltage changes", "Resilience indices", "Survivability", "SAIDI & SAIFI",
"Unscheduled generator outages", "Voltage dips", "Voltage level variations", "Voltage sags/swells", "Voltage unbalance",
"Average service availability index", "Average service interruption duration index", "Customer average interruption duration index",
"Customer average interruption frequency index", "Customer experiencing longest interruption durations", "Customer experiencing multiple interruptions",
"Customer experiencing multiple momentary interruptions", "Customer interrupted per interrupted index", "Economy", "Fairness", "Interrupted energy assessment rate",
"Load point indices per customer", "Loss of offsite power", "Minimum level of service targets", "Momentary average interruption frequency index",
"Security", "Transmission losses"]
outcomes_metrics = ["Load loss damage index", "Annual price cap", "Annual allowed revenue", "Cost of interruption", "Impact factor on the population",
"Noise", "Long distance transmission cost", "Performance based regulation regard/penalty structure", "Price of electricity", "Value of lost load"]
priority_hazards = []

# @app.before_request
# def before_request():
#     if oidc.user_loggedin:
#         g.user = okta_client.get_user(oidc.user_getfield("sub"))
#     else:
#         g.user = None

@app.route('/', methods=["GET", "POST"])
def index():
    if request.method == "POST":
        return redirect("/qualities")
    return render_template("base.html")

@app.route('/qualities', methods=["GET", "POST"])
def qualities():
    if request.method == "POST":
        return redirect("/goals")
    return render_template("qualities.html", generation_types=generation_types, load_types=load_types)

@app.route('/goals', methods=["GET", "POST"])
def goals():
    if request.method == "POST":
        return redirect("/hazards")
    return render_template("goals.html", inputs_metrics=inputs_metrics, capacity_metrics=capacity_metrics, capabilities_metrics=capabilities_metrics, performance_metrics=performance_metrics, outcomes_metrics=outcomes_metrics)

@app.route('/hazards', methods=["GET", "POST"])
def hazards():
    # clear variable if refreshed
    global priority_hazards
    priority_hazards = []
    # grabs all orange and red responses - appends to priority_hazards
    if request.method == "POST":
        #red
        if "bowtie_input[]" in request.form:
            priority_hazards = request.form.getlist("bowtie_input[]")
        return redirect("/bowtie")
    return render_template("hazards.html", physical_hazards=physical_hazards, cyber_hazards=cyber_hazards, priority_hazards=priority_hazards)

@app.route('/bowtie', methods=["GET", "POST"])
def bowtie():
    if request.method == "POST":
        return redirect("/vulnerabilities")
    return render_template("bowtie.html", priority_hazards=priority_hazards)

@app.route('/vulnerabilities', methods=["GET", "POST"])
def vulnerabilities():
    if request.method == "POST":
        return redirect("/risks")
    return render_template("vulnerabilities.html", priority_hazards=priority_hazards)

@app.route('/risks', methods=["GET", "POST"])
def risks():
    if request.method == "POST":
        return redirect("/suggestions")
    return render_template("risks.html", priority_hazards=priority_hazards)

@app.route('/suggestions', methods=["GET", "POST"])
def suggestions():
    if request.method == "POST":
        return redirect("/")
    return render_template("suggestions.html", priority_hazards=priority_hazards)

@app.route("/login")
@oidc.require_login
def login():
    return redirect(url_for("base"))


@app.route("/logout")
def logout():
    oidc.logout()
    return redirect(url_for("base"))
if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0')
