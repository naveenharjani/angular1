using Bernstein.IRS.Beehive.Models;
using Bernstein.IRS.Data;
using Newtonsoft.Json;
using NLog;
using System;
using System.Data;
using System.Data.SqlClient;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Web.Http.Description;
using Bernstein.IRS.Utility;
using Bernstein.IRS.Beehive.Api.Utility;
using Beehive_WebApp;

namespace Bernstein.IRS.Beehive.Api.Controller
{
   
    public class IndustriesController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");

        // GET: api/Industries
        public IHttpActionResult Get()
        {
            try
            {
                DataTable dtIndusties = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    DataSet ds = dh.ExecuteDataSet("spApiGetIndustries", CommandType.StoredProcedure);
                    dtIndusties = ds.Tables[0];
                }
                var industries = Newtonsoft.Json.JsonConvert.DeserializeObject(dtIndusties.DataTableToJson());
                return this.Ok(industries);
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetIndustries message:{0}", ex.Message);
                return this.Ok(ex.Message);
                //return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        // GET: api/Industries/5
        [ResponseType(typeof(IndustryModel))]
        public IHttpActionResult Get(int id)
        {
            try
            {
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@IndustryID", id);
                    DataSet dtIndustryRecord = dh.ExecuteDataSet("spApiGetIndustry", CommandType.StoredProcedure, sqlParams);
                    IndustryModel IM = new IndustryModel
                    {
                        IndustryId = Convert.ToInt32(dtIndustryRecord.Tables[0].Rows[0]["IndustryId"]),
                        Industry = Convert.ToString(dtIndustryRecord.Tables[0].Rows[0]["Industry"]),
                        EditDate = Convert.ToString(dtIndustryRecord.Tables[0].Rows[0]["EditDate"]),
                        Editor = Convert.ToInt32(dtIndustryRecord.Tables[0].Rows[0]["Editor"]),
                        IsResearch = Convert.ToString(dtIndustryRecord.Tables[0].Rows[0]["IsResearch"]),
                        SectorId = Convert.ToInt32(dtIndustryRecord.Tables[0].Rows[0]["SectorId"])
                    };

                    return this.Ok(IM);
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetIndustry message:{0}", ex.Message);
                return this.Ok(ex.Message);
                //return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        // POST: api/Industries
        public IHttpActionResult Post([FromBody] IndustryModel value)
        {
            //var Content = JsonConvert.SerializeObject(value.Content);
            string Content = JsonConvert.SerializeObject(value);
            var result = DBUpdate(-1, Content);
            var response = new HttpResponseMessage
            {
                ReasonPhrase = result
            };
            if (result.IndexOf("Error") == -1)
                response.StatusCode = HttpStatusCode.OK;
            else
                response.StatusCode = HttpStatusCode.InternalServerError;
            return this.Ok(response);
        }

        // PUT: api/Industries/5
        //public HttpResponseMessage Put(int id, [FromBody] ApiSaveModel value)
        //{
        //    var Content = JsonConvert.SerializeObject(value.Content);
        //    var result = DBUpdate(id, Content);
        //    if (result.IndexOf("Error") == -1)
        //        return Request.CreateResponse(HttpStatusCode.OK, new { serverResponse = result });
        //    else
        //    {
        //        var response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
        //        {
        //            Content = new StringContent(result)
        //        };
        //        return response;
        //    }
        //}

        // DELETE: api/Industries/5
        public void Delete(int id)
        {
        }

        private string DBUpdate(int id, string content)
        {
            dynamic data = JsonConvert.DeserializeObject(content);
            string IndustryName = data.Industry.ToString();
            try
            {
                string ip = Request.GetClientIpAddress();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[2];
                    Array.Clear(sqlParams, 0, sqlParams.Length);
                    sqlParams[0] = new SqlParameter("@IndustryId", id);
                    sqlParams[1] = new SqlParameter("@IndustryJSON", content);
                    int result = dh.ExecuteNonQuery("spApiSaveIndustry", CommandType.StoredProcedure, sqlParams);
                    logger.Info("saveIndustry request end by {0}", ip);
                    //string IndustryName = ((Newtonsoft.Json.Linq.JValue)((Newtonsoft.Json.Linq.JProperty)((Newtonsoft.Json.Linq.JContainer)
                    //    ((Newtonsoft.Json.Linq.JContainer)JsonConvert.DeserializeObject(content)).First).First.Next).Value).Value.ToString();
                    if (id == -1)
                    {
                        return "Industry : " + IndustryName + " Created Successfully!";
                    }
                    else
                    {
                        return "Industry : " + IndustryName + " U   pdated Sucessfully!";
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiSaveIndustry message:{0}", ex.Message);
                if (ex.Message.IndexOf("Cannot insert duplicate key") > 0)
                {
                    return "Error while Saving ! Industry Name :- " + IndustryName + " Duplicated. ";
                }
                else
                {
                    return "Error while creating or updating database";
                }
            }
        }

        public IHttpActionResult Put(int id, [FromBody]  IndustryModel value)
        {
            //var Content = JsonConvert.DeserializeObject(value);
            string Content = JsonConvert.SerializeObject(value);
            var result = DBUpdate(id, Content);
            var response = new HttpResponseMessage
            {
                ReasonPhrase = result
            };
            if (result.IndexOf("Error") == -1)
                response.StatusCode = HttpStatusCode.OK;
            else
                response.StatusCode = HttpStatusCode.InternalServerError;
            return this.Ok(response);
        }
    }
}
