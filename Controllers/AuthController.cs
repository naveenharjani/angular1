using Bernstein.IRS.Web.Auth;
using Bernstein.IRS.Web.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web;
using System.Web.Http;
using System.ServiceModel.Channels;
using NLog;

namespace Bernstein.IRS.Web.Controllers
{
    public class AuthController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");

        [Route("api/Auth/GetAccessToken")]
        [AllowAnonymous]
        [HttpPost]
        public IHttpActionResult GetAccessToken()
        {
            AuthenticateRequest authenticateRequestModel = new AuthenticateRequest { };
            System.Net.Http.Headers.HttpRequestHeaders headers = this.Request.Headers;

            if (headers.Contains("UserName"))
            {
                authenticateRequestModel.Username = Crypto.DecryptStringAES(headers.GetValues("username").First());
            }
            if (headers.Contains("key"))
            {
                authenticateRequestModel.key = Crypto.DecryptStringAES( headers.GetValues("key").First());
            }
            if (headers.Contains("applicationId"))
            {
                authenticateRequestModel.applicationId = Crypto.DecryptStringAES(headers.GetValues("applicationId").First());
            }
              
            var errorResponse = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            errorResponse.Content = new StringContent("Invalid User");
            logger.Info("Auth verify user", authenticateRequestModel);
            // User Verification from DB check
            if (JwtAuthManager.VerifyApplication(authenticateRequestModel.applicationId, authenticateRequestModel.key) && JwtAuthManager.VerifyUser(authenticateRequestModel))
            {
                    var response = JwtAuthManager.GetAccessAndRefreshToken(authenticateRequestModel, ipAddress());
                    if (response == null)
                    {
                        return Ok(errorResponse);
                    }
                    return Ok(response);                 
            }
            else
            {
                return Ok(errorResponse);
            }

        }

        [Route("api/Auth/GetRefreshToken")]
        [AllowAnonymous]
        [HttpPost]
        public IHttpActionResult GetRefreshToken()
        {
            logger.Info("Refresh token called");
            AuthenticateRequest authenticateRequestModel = new AuthenticateRequest { };
            System.Net.Http.Headers.HttpRequestHeaders headers = this.Request.Headers;

            if (headers.Contains("UserName"))
            {
                authenticateRequestModel.Username = Crypto.DecryptStringAES(headers.GetValues("username").First());
            }
            if (headers.Contains("key"))
            {
                authenticateRequestModel.key = Crypto.DecryptStringAES(headers.GetValues("key").First());
            }
            if (headers.Contains("applicationId"))
            {
                authenticateRequestModel.applicationId = Crypto.DecryptStringAES(headers.GetValues("applicationId").First());
            }
            if (headers.Contains("RefreshToken"))
            {
                authenticateRequestModel.RefreshToken = headers.GetValues("RefreshToken").First();
            }
            logger.Info("Refresh token Header called");
            var errorResponse = new HttpResponseMessage(HttpStatusCode.Unauthorized);
            errorResponse.Content = new StringContent("Invalid User or Token");

            // User Verification from DB check
            logger.Info("Refresh token verify user", authenticateRequestModel);
            if (JwtAuthManager.VerifyApplication(authenticateRequestModel.applicationId, authenticateRequestModel.key) && JwtAuthManager.VerifyUser(authenticateRequestModel) )
            {
                // Verify Refresh token from DB 
                logger.Info("verify refresh token", authenticateRequestModel);
                var refreshTokenList = JwtAuthManager.VerifyRefreshToken(authenticateRequestModel, ipAddress());
                var user = refreshTokenList?.SingleOrDefault(t => t.Token == authenticateRequestModel.RefreshToken);                
                if (user == null)
                {
                    return BadRequest("Invalid User or Token");
                }
                logger.Info("generate refresh token", authenticateRequestModel);
                var response = JwtAuthManager.GetAccessAndRefreshToken(authenticateRequestModel, ipAddress());
                return Ok(response);
            }
            else
            {
                return Ok(errorResponse);
            }

        }

        [Route("api/Auth/EncryptText")]
        [AllowAnonymous]
        [HttpGet]
        public IHttpActionResult EncryptText(string text)
        {

            var response = Crypto.EncryptStringToBytes(text);            
            return Ok(response);
        }

        [Route("api/Auth/HashText")]
        [AllowAnonymous]
        [HttpGet]
        public IHttpActionResult HashText(string text)
        {

            var response = Crypto.Hash(text);
            return Ok(response);
        }

        [Route("api/Auth/VerifyHashText")]
        [AllowAnonymous]
        [HttpGet]
        public IHttpActionResult VerifyApplication(string text)
        {
            var hash = Crypto.Hash(text);
            var response = Crypto.Verify(text,hash);
            return Ok(response);
        }
        private string ipAddress(HttpRequestMessage request = null)
        {  
            request = request ?? Request;

            if (request.Properties.ContainsKey("MS_HttpContext"))
            {
                return ((HttpContextWrapper)request.Properties["MS_HttpContext"]).Request.UserHostAddress;
            }
            else if (request.Properties.ContainsKey(RemoteEndpointMessageProperty.Name))
            {
                RemoteEndpointMessageProperty prop = (RemoteEndpointMessageProperty)request.Properties[RemoteEndpointMessageProperty.Name];
                return prop.Address;
            }
            else if (HttpContext.Current != null)
            {
                return HttpContext.Current.Request.UserHostAddress;
            }
            else
            {
                return null;
            }

        }

    }
}