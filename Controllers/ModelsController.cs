using Bernstein.IRS.Beehive.Api.Utility;
using Bernstein.IRS.Data;
using Bernstein.IRS.Utility;
using Bernstein.IRS.Web.Auth;
using NLog;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace Bernstein.IRS.Beehive.Api.Controller
{
   // [JwtAuthentication]
    public class ModelsController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");

        [Route("api/models/{ModelId}/tooltip")]
        [HttpGet]
        public IHttpActionResult GetTooltip(string modelId = "")
        {
            try
            {
                string ip = Request.GetClientIpAddress();
                DataTable dtSearchResult = new DataTable();
                if (Url.Request.RequestUri.LocalPath.Split('/')[2] == "models")
                {
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        logger.Info("getModelToolTip request by {0} for ModelId:{1}", ip, modelId);
                        SqlParameter[] sqlParams = new SqlParameter[1];
                        sqlParams[0] = new SqlParameter("@ModelId", modelId);
                        dtSearchResult = dh.ExecuteDataTable("spApiGetModelToolTip", CommandType.StoredProcedure, sqlParams);
                    }
                }
                var models = Newtonsoft.Json.JsonConvert.DeserializeObject(dtSearchResult.DataTableToJson());
                logger.Info("getToolTip request end by {0}", ip);
                return this.Ok(models);

            }
            catch (Exception ex)
            {
                logger.Error("Exception at spGetModelChangeToolTip message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        // GET: api/Models/5
        [Route("api/models/GetModels/")]
        public IHttpActionResult GetModels(string userId)
        {
                string ip = Request.GetClientIpAddress();
                DataTable dtSearchResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@UserID", userId);
                    dtSearchResult = dh.ExecuteDataTable("spApiGetModels", CommandType.StoredProcedure,sqlParams);
                }
                var models = Newtonsoft.Json.JsonConvert.DeserializeObject(dtSearchResult.DataTableToJson());
                return this.Ok(models);
        }


        [Route("api/models/modelsHistory/")]
        [HttpGet]
        public IHttpActionResult GetModelsHistory(string ticker)
        {
            string ip = Request.GetClientIpAddress();
            //((string[])(Request.Headers.GetValues("params1")))[0]
            try
            {
                //logger.Info("getSearchData request by {0} for {1} text", ip, text);
                string company = string.Empty;


                DataTable dtSearchResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@SearchCriteria", ticker ?? string.Empty);

                    dtSearchResult = dh.ExecuteDataTable("spApiGetModelHistory", CommandType.StoredProcedure, sqlParams);
                }
                var models = Newtonsoft.Json.JsonConvert.DeserializeObject(dtSearchResult.DataTableToJson());
                logger.Info("spApiGetModelHistory request end by {0}", ip);
                return this.Ok(models);

            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetModelHistory message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        [HttpDelete]
        public HttpResponseMessage Delete(int id, int UserID)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[2];
                    sqlParams[0] = new SqlParameter("@ModelId", id);
                    sqlParams[1] = new SqlParameter("@EditorId", UserID);
                    int result = dh.ExecuteNonQuery("spApiDeleteModel", CommandType.StoredProcedure, sqlParams);
                }

                HttpResponseMessage response = new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    ReasonPhrase = "Model ID " + id.ToString() + " deleted Succesfully !"
                };
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getModelData message:{0}", ex.Message);
                HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent("Error")
                };
                return response;
            }
        }
    }
}
