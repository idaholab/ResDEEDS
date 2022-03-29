from flask import Flask, render_template, g, url_for, request, redirect, session
from werkzeug.utils import redirect
from flask_oidc import OpenIDConnect
from okta import UsersClient
from backend import db
from flask_sqlalchemy import SQLAlchemy
from backend.impact import Impact
from backend.system import *
from backend.hazard import Hazard, HazardToHazardLink, HazardToImpactLink
import json
import csv
import logging

with open("../config/config.json", "r") as config_file:
    config = json.load(config_file)

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = f'mysql://{config["database"]["db_user"]}:{config["database"]["db_pass"]}@localhost/{config["database"]["db_name"]}'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db.init_app(app)

if config["database"]["drop_and_recreate"]:
    with app.app_context():
        db.drop_all()
        db.create_all()
        # system = SpineSystem(name='Test Spine system', spine_dir="", user="Test user")
        # db.session.add(system)
        # system = DefaultSystem(name='Test base system', user="Test user")
        # db.session.add(system)


        with open("../config/hazards.csv", "r", encoding="utf-8-sig") as csvfile:
            header_line = csvfile.readline()
            reader = csv.reader(csvfile, delimiter=',', skipinitialspace=True)
            NAME = 0
            PRIMARY_CAT = 1
            SECONDARY_CAT = 2
            ASSOC_HAZARDS = 3
            IMPACTS = 4
            METRICS = 5
            for row in reader:
                name = row[NAME]
                primary_cat = row[PRIMARY_CAT]
                secondary_cat = row[SECONDARY_CAT]
                impacts = row[IMPACTS].split(';')
                
                new_impacts = []
                for impact in [i.lstrip() for i in impacts if i != '']:
                    if impact not in Impact.TYPES:
                        logging.warning(f'Impact type {impact} not found while loading templates.')
                    new_impact = Impact(is_template=True, impact_type=impact, severity=0.5)
                    # print(Impact.get_by_name(impact))
                    # if Impact.get_by_name(impact) is not None:
                    #     try:
                    #         type = ImpactType(impact)
                    #         new_impact = Impact(name=impact, type=ImpactType(impact), severity=0.5)
                    #     except ValueError as e:
                    #         new_impact = Impact(name=impact, type=ImpactType.OTHER, type_other=impact, severity=0.5)  
                    db.session.add(new_impact)
                    new_impacts.append(new_impact)

                    link = HazardToImpactLink(this_type=name, that_type=impact)
                    db.session.add(link)

                hazard = Hazard(is_template=True, name=name, hazard_type=name, impacts=new_impacts,
                            primary_category=primary_cat, secondary_category=secondary_cat)
                db.session.add(hazard)

                assoc_hazards = row[ASSOC_HAZARDS].split(';')
                for assoc_hazard in [h.lstrip() for h in assoc_hazards if h != '']:
                    link = HazardToHazardLink(this_type=name, that_type=assoc_hazard)
                    db.session.add(link)

        # impact = Impact(name='Test impact', type=ImpactType.SUBSTATIONS, severity=0.75)
        # db.session.add(impact)
        # hazard = Hazard(is_template=True, name='Test template hazard', type=HazardType.RANSOMWARE, impacts=[impact])
        # db.session.add(hazard)
        # link = HazardToHazardLink(this_type=HazardType.RANSOMWARE, that_type=HazardType.DENIAL_OF_SERVICE)
        # db.session.add(link)
        # link = HazardToImpactLink(this_type=HazardType.RANSOMWARE, that_type=ImpactType.SUBSTATIONS)
        # db.session.add(link)

        db.session.commit()
            

#initialize okta
app.config["OIDC_CLIENT_SECRETS"] = "../config/client_secrets.json"
app.config["OIDC_COOKIE_SECURE"] = False
app.config["OIDC_CALLBACK_ROUTE"] = "/oidc/callback"
app.config["OIDC_SCOPES"] = ["openid", "email", "profile"]
app.secret_key = "f46cBXvh34ovp1lxCmfE"
app.config["OIDC_ID_TOKEN_COOKIE_NAME"] = "oidc_token"
oidc = OpenIDConnect(app)
okta_client = UsersClient("https://dev-53761026.okta.com", "00nJcCJMZXtOWmdloatdx_SzvIwmRDi3LalZFeh6DG")

# global variables
generation_types = ["Diesel Generator", "Wind", "PV Solar"]
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

@app.before_request
def before_request():
    if oidc.user_loggedin:
        g.user = okta_client.get_user(oidc.user_getfield("sub"))
    else:
        #Temporary for testing
        # class Object:
        #     pass
        # g.user = Object()
        # g.user.profile = Object()
        # g.user.profile.email = "someone@example.com"
        # g.user.profile.firstName = "Someone"
        g.user = None

@app.route('/', methods=["GET", "POST"])
def index():
    system = []
    if g.user is not None:
        system = System.get_all_for_user(g.user.profile.email)
    if request.method == "POST":
        if len(system) == 0:
            sysName = request.form["sysNameVal"]
            #System(name=sysName, user=g.user.profile.email).save()
            sys = DefaultSystem(name=sysName, user=g.user.profile.email)
            db.session.add(sys)
            db.session.commit()
            session["system_id"] = sys.obj_id
        return redirect("/qualities")

    #Temporary - for testing without okta
    # if g.user is None:
    #     sys = System(name='Test system', user='someone@example.com')
    #     db.session.add(sys)
    #     db.session.commit()
    #     session['system_id'] = sys.obj_id
    #     print('Goodbye')
    #     return redirect("/qualities")
    #####

    return render_template("base.html", system=system)

@app.route('/qualities', methods=["GET", "POST"])
def qualities():
    #system = System.objects(user = g.user.profile.email)
    system_id = session["system_id"]
    system = System.get_by_id(system_id)
    print(system_id, system)
    if request.method == "POST":
        generators = request.form.getlist('gen_use')
        print(generators)
        caps = request.form.getlist('gen_cap')
        print(caps)
        descs = request.form.getlist('desc')
        print(descs)
        new_gens = []
        for (gen, cap, desc) in zip(generators, caps, descs):
            print(gen, cap, desc)
            new_gen = Generation(name=gen, generation_type=gen, capacity_kw=cap, description=desc, system_id=system_id)
            db.session.add(new_gen)
            new_gens.append(new_gen)
        system.generation = new_gens
        db.session.commit()
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
    return redirect(url_for("index"))


@app.route("/logout")
def logout():
    oidc.logout()
    return redirect(url_for("index"))
if __name__ == '__main__':
    app.run(debug=True)
