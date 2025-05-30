/**
 * Copyright (c) 2006-2025, JGraph Ltd, draw.io AG
 */
package com.mxgraph.online;

import java.io.IOException;

@SuppressWarnings("serial")
abstract public class MSGraphAuth extends AbsAuth
{
	public static String CLIENT_SECRET_FILE_PATH = "msgraph_client_secret";
	public static String CLIENT_ID_FILE_PATH = "msgraph_client_id";
	public static String TENANT_ID_FILE_PATH = "msgraph_tenant_id";

	private static Config CONFIG = null;

	protected Config getConfig()
	{
		if (CONFIG == null)
		{
			String clientSecrets = SecretFacade.getSecret(CLIENT_SECRET_FILE_PATH, getServletContext());
			String clientId = SecretFacade.getSecret(CLIENT_ID_FILE_PATH, getServletContext());
			String tenantId = null;

			try
			{
				tenantId = SecretFacade.getSecret(TENANT_ID_FILE_PATH, getServletContext());
			} catch (Exception e) {}
	
			CONFIG = new Config(clientId, clientSecrets);
	
			String tenantIdPathPart = (tenantId != null && !tenantId.trim().isEmpty()) ? tenantId.trim() : "common";
			CONFIG.AUTH_SERVICE_URL = "https://login.microsoftonline.com/" + tenantIdPathPart + "/oauth2/v2.0/token";
	
			CONFIG.REDIRECT_PATH = "/microsoft";
		}
	
		return CONFIG;
	}

	public MSGraphAuth()
	{
		super();
		cookiePath = "/microsoft";
	}

	protected String processAuthResponse(String authRes, boolean jsonResponse)
	{
		StringBuffer res = new StringBuffer();

		//Call the opener callback function directly with the given json
		if (!jsonResponse)
		{
			res.append("<!DOCTYPE html><html><head><script>");
			res.append("(function() { var authInfo = ");  //The following is a json containing access_token
		}

		res.append(authRes);

		if (!jsonResponse)
		{
			res.append(";");
			res.append("if (window.opener != null && window.opener.onOneDriveCallback != null)");
			res.append("{");
			res.append("	window.opener.onOneDriveCallback(authInfo, window);");
			res.append("} else {");
			res.append("	var head = document.getElementsByTagName('head')[0];");
			res.append("	var script = document.createElement('script');");
			res.append("	script.onload = function() ");
			res.append("	{");
			res.append("		var authInfoStr = JSON.stringify(authInfo);");
			res.append("		localStorage.setItem('.oneDriveAuthInfo', '{}');"); //setting this storage item means we have a refresh token
			res.append("		Office.onReady(function () { Office.context.ui.messageParent(authInfoStr, { targetOrigin: '*' });});"); //TODO Use specific domain (more secure)
			res.append("	};");
			res.append("	script.src = 'https://appsforoffice.microsoft.com/lib/1.1/hosted/office.js';");
			res.append("	head.appendChild(script);");
			res.append("}");
			res.append("})();</script></head><body><div>Automatic login interrupted. Please close and select OneDrive again.</div></body></html>");
		}

		return res.toString();
	}
}