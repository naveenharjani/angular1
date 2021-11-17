using Bernstein.IRS.Beehive.Models;
using Bernstein.IRS.Utility;
using Bernstein.IRS.Data;
using Newtonsoft.Json;
using NLog;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Bernstein.IRS.Beehive.Api.Utility;

namespace Bernstein.IRS.Beehive.Api.Controller
{
    public class SecuritiesController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");
        // GET: api/Securities
        public IHttpActionResult Get()
        {
            try
            {
                DataTable dtSecurities = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    dtSecurities = dh.ExecuteDataTable("spApiGetSecurities", CommandType.StoredProcedure);
                }
                var Securities = Newtonsoft.Json.JsonConvert.DeserializeObject(dtSecurities.DataTableToJson());
                return this.Ok(Securities);
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetSecurities message:{0}", ex.Message);
                return this.Ok(ex.Message);
                //return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        // GET: api/Securities/5
        public IHttpActionResult Get(int id)
        {
            try
            {
                DataSet dtSecurities = new DataSet();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@SecurityId", id);
                    dtSecurities = dh.ExecuteDataSet("spApiGetSecurity", CommandType.StoredProcedure, sqlParams);
                    //var security = Newtonsoft.Json.JsonConvert.DeserializeObject(dtSecurities.Tables[0].DataTableToJson());
                    DataTable dropdowns = new DataTable();
                    if (dtSecurities.Tables[0].Rows.Count > 0)
                    {
                        Array.Clear(sqlParams, 0, sqlParams.Length);
                        sqlParams = new SqlParameter[2];
                        sqlParams[0] = new SqlParameter("@Style", 1);
                        sqlParams[1] = new SqlParameter("@CompanyId", int.Parse(dtSecurities.Tables[0].Rows[0].ItemArray[20].ToString()));
                        dropdowns = dh.ExecuteDataTable("spGetCompanySecurities", CommandType.StoredProcedure, sqlParams);
                    }
                    //var companySecurities = Newtonsoft.Json.JsonConvert.DeserializeObject(dropdowns.DataTableToJson());
                    //dynamic completeSet = new JObject();
                    //completeSet.securityData = security;
                    //completeSet.companySecurities = companySecurities;
                    //dynamic Content = new JArray(completeSet);

                    //return Request.CreateResponse(HttpStatusCode.OK, new
                    //{
                    //    Content
                    //});

                    foreach (DataRow row in dtSecurities.Tables[0].Rows)
                    {
                        SecurityDataModel SecurityModel = new SecurityDataModel
                        {
                            SecurityId = row.Field<int>("SecurityId"),
                            TickerType = row.Field<string>("TickerType"),
                            Company = row.Field<string>("Company"),
                            Ticker = row.Field<string>("Ticker"),
                            RIC = row.Field<string>("RIC"),
                            CUSIP = row.Field<string>("CUSIP"),
                            SEDOL = row.Field<string>("CINS"),
                            CINS = row.Field<string>("CINS"),
                            ISIN = row.Field<string>("VALOREN"),
                            VALOREN = row.Field<string>("VALOREN"),
                            ExchangeCode = row.Field<string>("ExchangeCode"),
                            CurrencyCode = row.Field<string>("CurrencyCode"),
                            BenchmarkIndex = row.Field<string>("BenchmarkIndex"),
                            CountryCode = row.Field<string>("CountryCode"),
                            RegionId = row.Field<int>("RegionId"),
                            IsActive = (row.Field<int>("IsActive") * -1),
                            Editor = row.Field<int>("Editor"),
                            EditDate = row.Field<DateTime>("EditDate"),
                            CompanyId = row.Field<int>("CompanyId"),
                            TypeId = row.Field<int>("TypeId"),
                            Alias = row.Field<string>("Alias"),
                            GICS_ID = (row["GICS_ID"] == DBNull.Value) ? default(int) : row.Field<int>("GICS_ID"),
                            MobileStatus = (row["MobileStatus"] == DBNull.Value) ? default(int) : row.Field<int>("MobileStatus"),
                            CompanyData = FetchList(dropdowns)
                        };
                        return this.Ok(SecurityModel);
                    }
                }
                return this.Ok();
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetSecurity message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        private List<CompanyDataModel> FetchList(DataTable dt)
        {

            var convertedList = (from rw in dt.AsEnumerable()
                                 select new CompanyDataModel()
                                 {
                                     CompanyId = Convert.ToInt32(rw["CompanyId"]),
                                     Company = Convert.ToString(rw["Company"]),
                                     SecurityId = Convert.ToInt32(rw["SecurityId"]),
                                     Ticker = Convert.ToString(rw["Ticker"]),
                                     IsPrimary = Convert.ToString(rw["IsPrimary"]),
                                     OrdNo = Convert.ToInt32(rw["OrdNo"]),
                                 }).ToList();

            return convertedList;
        }

        // POST: api/Securities
        public IHttpActionResult Post([FromBody] SecurityDataModel value)
        {
            string Content = JsonConvert.SerializeObject(value);
            var result = DBUpdate(-1, Content);
            return this.Ok(result);
        }

        // PUT: api/Securities/5
        public IHttpActionResult Put(int id, [FromBody] SecurityDataModel value)
        {
            string Content = JsonConvert.SerializeObject(value);
            var result = DBUpdate(id, Content);
            return this.Ok(result);
        }

        // DELETE: api/Securities/5
        public void Delete(int id)
        {
        }

        [Route("api/securities/CompanyDetails/{companyId}")]
        [HttpGet]
        public IHttpActionResult GetCompany(int companyId)
        {
            try
            {
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[2];
                    sqlParams[0] = new SqlParameter("@Style", 1);
                    sqlParams[1] = new SqlParameter("@CompanyId", companyId);
                    DataTable dropdowns = new DataTable();
                    dropdowns = dh.ExecuteDataTable("spGetCompanySecurities", CommandType.StoredProcedure, sqlParams);
                    var companySecurities = Newtonsoft.Json.JsonConvert.DeserializeObject(dropdowns.DataTableToJson());
                    return this.Ok(companySecurities);
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spGetCompanySecurities message:{0}", ex.Message);
                return this.Ok(ex.Message);
                //return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        private string DBUpdateOld(int id, string content)
        {
            try
            {
                string ip = Request.GetClientIpAddress();
                dynamic data = JsonConvert.DeserializeObject(content);
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[2];
                    Array.Clear(sqlParams, 0, sqlParams.Length);
                    sqlParams[0] = new SqlParameter("@SecurityId", id);
                    sqlParams[1] = new SqlParameter("@securityJSON", content);
                    int result = dh.ExecuteNonQuery("spApiSaveSecurity", CommandType.StoredProcedure, sqlParams);
                    logger.Info("saveIndustry request end by {0}", ip);
                    if (id == -1)
                    {
                        return "Security : " + data.Ticker.ToString() + " Created Sucessfully!";
                    }
                    else
                    {
                        return "Security : " + data.Ticker.ToString() + " Updated Sucessfully!";
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiSaveSecurity message:{0}", ex.Message);
                return "Error while creating or updating database";
            }
        }
        private HttpResponseMessage DBUpdate(int id, string content)
        {
            dynamic data = JsonConvert.DeserializeObject(content);
            string Ticker = data.Ticker.ToString();
            HttpResponseMessage response = new HttpResponseMessage();
            try
            {
                string ip = Request.GetClientIpAddress();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[2];
                    Array.Clear(sqlParams, 0, sqlParams.Length);
                    sqlParams[0] = new SqlParameter("@SecurityId", id);
                    sqlParams[1] = new SqlParameter("@securityJSON", content);
                    logger.Info("saveIndustry request end by {0}", ip);
                    int result = dh.ExecuteNonQuery("spApiSaveSecurity", CommandType.StoredProcedure, sqlParams);

                    if (id == -1)
                    {
                        response.ReasonPhrase = "Security : " + Ticker + " Created Sucessfully";
                        response.StatusCode = HttpStatusCode.Created;
                    }
                    else
                    {
                        response.ReasonPhrase = "Security : " + Ticker + " Updated Sucessfully";
                        response.StatusCode = HttpStatusCode.OK;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiSaveProductGroup message:{0}", ex.Message);
                if (ex.Message.IndexOf("IX_Securities2_Ticker") > 0)
                {
                    response.StatusCode = HttpStatusCode.InternalServerError;
                    response.ReasonPhrase = "Error while Saving ! Ticker :- " + Ticker + " Duplicated. ";
                }
                else
                {
                    response.StatusCode = HttpStatusCode.InternalServerError;
                    response.ReasonPhrase = "Error while creating or updating database";
                }
            }
            return response;
        }
    }
}
