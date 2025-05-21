import configparser
from cryptography.fernet import Fernet

import click
import paramiko


@click.group()
@click.pass_context
def cli(ctx):
    """Create cli."""
    return


@click.command()
def deploy():
    """Deploy Resdeeds to production."""
    username, password = get_credentials()
    click.confirm(f"Are you sure you want to deploy ResDEEDS?", abort=True)

    # connect to remote server
    ssh = paramiko.SSHClient()
    ssh.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    ssh.connect("resdeedsdev1", username=username, password=password)
    click.echo(f"Deploying to ResDEEDS to production")

    # load deploy bash script
    with open("scripts/deploy.sh", "r") as f:
        deploy_script = f.read()

    # run remote commands from deploy script
    _, ssh_stdout, _ = ssh.exec_command(deploy_script)
    while True:
        line = ssh_stdout.readline()
        if not line:
            break
        print(line, end="")
    ssh.close()


@click.command("configure")
@click.option("--username", required=True, prompt=True)
@click.option("--password", required=True, prompt=True, hide_input=True)
def configure(password, username):
    """Configure access point in config.ini file."""
    config = configparser.ConfigParser()
    key = Fernet.generate_key()
    config["DEFAULT"] = {
        "key": str(key, "utf-8"),
        "password": _encrypt(password, key),
        "username": username,
    }
    with open("config.ini", "w") as configfile:
        config.write(configfile)


def get_credentials() -> str:
    """Get crednitials from config.ini file."""
    config = configparser.ConfigParser()
    config.read("config.ini", encoding="cp1251")
    try:
        key = config["DEFAULT"]["key"]
        password = config["DEFAULT"]["password"]
        username = config["DEFAULT"]["username"]

        password = _decrypt(password, key)
    except KeyError:
        click.echo("no credentials found - running configure")
        configure()
    return username, password


def _encrypt(password: str, key: bytes) -> str:
    """Encrypt password."""
    return str(Fernet(key).encrypt(password.encode()), "utf-8")


def _decrypt(password: bytes, key: bytes) -> str:
    """Decrypt password."""
    return Fernet(key).decrypt(password).decode()


if __name__ == "__main__":
    cli.add_command(deploy)
    cli.add_command(configure)
    cli()
