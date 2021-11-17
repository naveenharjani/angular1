using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using Bernstein.IRS.Beehive.Models;
using Bernstein.IRS.Data;
using Bernstein.IRS.Utility;
using Newtonsoft.Json;
using NLog;
using System.Data;
using System.Data.SqlClient;
using System.Xml;
using System.Text;
using Bernstein.IRS.Beehive.Api.Utility;
using System.Xml.Linq;
using System.Configuration;
using Bernstein.IRS;
using System.Data.SqlTypes;
using System.IO;

namespace Bernstein.IRS.Beehive.Api.Controller
{
    public class ToolsApiController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");



        /// <summary>
        /// Get Estimates Info
        /// </summary>
        /// <param name="payload"></param>
        /// user and securityid
        /// <returns></returns>
        [Route("api/toolsapi/getestimatesinfo")]
        [HttpPost]
        public HttpResponseMessage GetEstimatesInfo(ToolsPayLoad payload)
        {
            try
            {
                //System.Web.HttpUtility.UrlEncode();

                if (payload == null)
                {
                    logger.Info("Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                //string SecurityId = string.Empty, user = string.Empty;


                if (payload.SecurityId == 0 || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("Missing Params Bad Request,securityid:{0}, user:{1}", payload.SecurityId, payload.User);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    logger.Info("Method Requested by {0} for SecurityId {1}", payload.User, payload.SecurityId);
                    StringBuilder result = new StringBuilder();
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {

                        DataTable dtResult = new DataTable();

                        SqlParameter[] sqlParams = new SqlParameter[1];
                        sqlParams[0] = new SqlParameter("@SecurityId", Convert.ToInt32(payload.SecurityId));
                        result.Append("<Root>");
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersMetaDataXml", CommandType.StoredProcedure));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersEstimatePeriodsXml", CommandType.StoredProcedure));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersTickerDataXml", CommandType.StoredProcedure, sqlParams));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersAnalystDataXml", CommandType.StoredProcedure, sqlParams));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersMarketDataXml", CommandType.StoredProcedure, sqlParams));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersEstimatesDataAnnualXml", CommandType.StoredProcedure, sqlParams));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersEstimatesDataQuarterlyXml", CommandType.StoredProcedure, sqlParams));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersValuationsDataXml", CommandType.StoredProcedure, sqlParams));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersValuationsFormulaeXml", CommandType.StoredProcedure, sqlParams));
                        result.Append(dh.ExecuteXmlReader("spGetFinancialNumbersFXRatesXml", CommandType.StoredProcedure));
                        result.Append("</Root>");

                        SaveFinancialsDataServiceLog(dh, "GetEstimatesInfo", "securityId=" + payload.SecurityId, payload.User);

                    }
                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(result.ToString());
                    logger.Info("Method End");
                    return response;
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }
        }

        /// <summary>
        /// getAnalystTickerHoldings will accept XML payload from word research template
        /// Retrieves analyst holdings for all the tickers in the input xml
        /// </summary>
        /// <param name="payload"></param>
        /// <returns>Disclosure text</returns>
        [Route("api/toolsapi/getauthorholdings")]
        [HttpPost]
        public HttpResponseMessage GetAuthorHoldings(ToolsPayLoad payload)
        {
            try
            {

                if (payload == null)
                {
                    logger.Info("GetAuthorHoldings - Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                if (String.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("GetAuthorHoldings - Missing Params Bad Request user:{1},xml:{2}", payload.User, payload.XmlLoad);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    logger.Info("GetAuthorHoldings - Method Requested by {0} for XmlLoad: {1}", payload.User, payload.XmlLoad);
                    string xml = payload.XmlLoad, user = payload.User;
                    //logger.Info("Method Requested by {0}, Payload: {1}", user, xml);
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {

                        SqlParameter[] sqlParams = new SqlParameter[1];
                        sqlParams[0] = new SqlParameter("@DocXML", payload.XmlLoad);
                        DataTable dtHoldings = new DataTable();
                        dtHoldings = dh.ExecuteDataTable("spGetAuthorHoldings", CommandType.StoredProcedure, sqlParams);

                        //string sParameters = "instructionXml=" + xml + "&source=" + source;
                        //SaveFinancialsDataServiceLog(dh, "SetEstimatesInfo", sParameters, user);

                        var response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(dtHoldings.DataTableToJson());
                        logger.Info("GetAuthorHoldings - Method returned - {0}",response.Content.ReadAsStringAsync().Result);
                        return response;
                    }
                }


            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetAuthorHoldings message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }

        }


        /// <summary>
        /// setEstimatesInfo will accept XML payload from XL tool with Source and User as query string.
        /// Saves Financial numbers
        /// </summary>
        /// <param name="payload"></param>
        ///  Source and User
        /// <returns></returns>
        [Route("api/toolsapi/setestimatesinfo")]
        [HttpPost]
        public HttpResponseMessage SetEstimatesInfo(ToolsPayLoad payload)
        {
            try
            {

                if (payload == null)
                {
                    logger.Info("Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                //var qString = request.GetQueryStrings();               
                //qString.TryGetValue("source", out source);
                //qString.TryGetValue("user", out user);
                //string xml = request.Content.ReadAsStringAsync().Result;
                if (String.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.Source) || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("Missing Params Bad Request,source:{0}, user:{1},xml:{2}", payload.Source, payload.User, payload.XmlLoad);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    string xml = payload.XmlLoad, source = payload.Source, user = payload.User;
                    logger.Info("Method Requested by {0} from Source:{1}, Payload: {2}", user, source, xml);
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {

                        SqlParameter[] sqlParams = new SqlParameter[2];
                        sqlParams[0] = new SqlParameter("@FinancialNumberXML", xml);
                        sqlParams[1] = new SqlParameter("@Source", source);

                        var res = dh.ExecuteScalar("spSaveFinancialNumbers", CommandType.StoredProcedure, sqlParams);

                        string sParameters = "instructionXml=" + xml + "&source=" + source;
                        SaveFinancialsDataServiceLog(dh, "SetEstimatesInfo", sParameters, user);

                        if (res != null && !string.IsNullOrEmpty(res.ToString()))
                        {
                            var response = new HttpResponseMessage(HttpStatusCode.OK);
                            response.Content = new StringContent(res.ToString());
                            logger.Info("Method End");
                            return response;
                        }
                        else
                        {
                            logger.Info("Method Requested by {0} from Source:{1}, Payload: {2} is bad Request", user, source, xml);
                            return new HttpResponseMessage(HttpStatusCode.BadRequest);
                        }
                    }
                }


            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }

        }

        /// <summary>
        /// Set Eps Estimates Info
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Route("api/toolsapi/SetEpsEstimatesInfo")]
        [HttpPost]
        public HttpResponseMessage SetEpsEstimatesInfo(ToolsPayLoad payload)
        {
            try
            {

                if (payload == null)
                {
                    logger.Info("Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }


                if (String.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.Source) || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("Missing Params Bad Request,source:{0}, user:{1},xml:{2}", payload.Source, payload.User, payload.XmlLoad);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    //var qString = request.GetQueryStrings();
                    //string source, user = string.Empty;
                    //qString.TryGetValue("source", out source);
                    //qString.TryGetValue("user", out user);
                    //string xml = request.Content.ReadAsStringAsync().Result;


                    logger.Info("Method Requested by {0} from Source:{1}, Payload: {2}", payload.User, payload.Source, payload.XmlLoad);

                    if (String.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.Source))
                    {
                        logger.Info("Method Requested by {0} is Bad Request", payload.User);
                        return new HttpResponseMessage(HttpStatusCode.BadRequest);
                    }
                    else
                    {
                        using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                        {

                            SqlParameter[] sqlParams = new SqlParameter[2];
                            sqlParams[0] = new SqlParameter("@FinancialNumberXML", payload.XmlLoad);
                            sqlParams[1] = new SqlParameter("@Source", payload.Source);

                            var res = dh.ExecuteScalar("spSaveEpsForMigration", CommandType.StoredProcedure, sqlParams);

                            string sParameters = "instructionXml=" + payload.XmlLoad + "&source=" + payload.Source;
                            SaveFinancialsDataServiceLog(dh, "SetEpsEstimatesInfo", sParameters, payload.User);

                            if (res != null && !string.IsNullOrEmpty(res.ToString()))
                            {
                                var response = new HttpResponseMessage(HttpStatusCode.OK);
                                response.Content = new StringContent(res.ToString());
                                logger.Info("Method End");
                                return response;
                            }
                            else
                            {
                                logger.Info("Method Requested by {0} from Source:{1}, Payload: {2} is bad Request", payload.User, payload.Source, payload.XmlLoad);
                                return new HttpResponseMessage(HttpStatusCode.BadRequest);
                            }

                        }
                    }
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }



        }

        /// <summary>
        /// Set Benchmark Estimates Info
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Route("api/toolsapi/SetBenchmarkEstimatesInfo")]
        [HttpPost]
        public HttpResponseMessage SetBenchmarkEstimatesInfo(ToolsPayLoad payload)
        {
            try
            {

                if (payload == null)
                {
                    logger.Info("Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }


                if (String.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.Source) || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("Missing Params Bad Request,source:{0}, user:{1},xml:{2}", payload.Source, payload.User, payload.XmlLoad);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    //    var qString = request.GetQueryStrings();
                    //string source, user = string.Empty;
                    //qString.TryGetValue("source", out source);
                    //qString.TryGetValue("user", out user);
                    //string xml = request.Content.ReadAsStringAsync().Result;


                    logger.Info("Method Requested by {0} from Source:{1}, Payload: {2}", payload.User, payload.Source, payload.XmlLoad);

                    if (String.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.Source))
                    {
                        logger.Info("Method Requested by {0} is Bad Request", payload.User);
                        return new HttpResponseMessage(HttpStatusCode.BadRequest);
                    }
                    else
                    {
                        using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                        {

                            SqlParameter[] sqlParams = new SqlParameter[2];
                            sqlParams[0] = new SqlParameter("@FinancialNumberXML", payload.XmlLoad);
                            sqlParams[1] = new SqlParameter("@Source", payload.Source);

                            var res = dh.ExecuteScalar("spSaveBenchmarkIndexFinancialNumbers", CommandType.StoredProcedure, sqlParams);

                            string sParameters = "instructionXml=" + payload.XmlLoad + "&source=" + payload.Source;
                            SaveFinancialsDataServiceLog(dh, "SetBenchmarkEstimatesInfo", sParameters, payload.User);

                            if (res != null && !string.IsNullOrEmpty(res.ToString()))
                            {
                                var response = new HttpResponseMessage(HttpStatusCode.OK);
                                response.Content = new StringContent(res.ToString());
                                logger.Info("Method End");
                                return response;
                            }
                            else
                            {
                                logger.Info("Method Requested by {0} from Source:{1}, Payload: {2} is bad Request", payload.User, payload.Source, payload.XmlLoad);
                                return new HttpResponseMessage(HttpStatusCode.BadRequest);
                            }

                        }
                    }
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }



        }

        /// <summary>
        /// Get Company Financials
        /// </summary>
        /// <param name="payload"></param>
        /// user and xml
        /// <returns></returns>
        [Route("api/toolsapi/GetCompanyFinancials")]
        [HttpPost]
        public HttpResponseMessage GetCompanyFinancials(ToolsPayLoad payload)
        {
            try
            {
                if (payload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                if (string.IsNullOrEmpty(payload.User) || string.IsNullOrEmpty(payload.XmlLoad))
                {
                    logger.Info("Params Missing at Method Bad Request,user:{0}, xmlLoad:{1}", payload.User, payload.XmlLoad);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    //string sCompanyId = string.Empty;
                    //string sSecurityId = string.Empty;
                    //string sPromoteDraft = string.Empty;
                    string xml = payload.XmlLoad;
                    string user = payload.User;

                    //var qString = request.GetQueryStrings();
                    //string user = string.Empty;
                    //qString.TryGetValue("user", out user);
                    //xml = request.Content.ReadAsStringAsync().Result;

                    logger.Info("Method Requested by {0} and payload: {1}", user, xml);
                    DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString());
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@InXml", xml);
                    StringBuilder result = new StringBuilder();
                    result.Append("<CompanyFinancials>");

                    try
                    {
                        result.Append(dh.ExecuteXmlReader("spGetCompanyRatingXml", CommandType.StoredProcedure, sqlParams));
                    }
                    catch (Exception ex)
                    {
                        result.Append("<Company error=\"" + ex.Message + "\"></Company>");
                    }
                    try
                    {
                        result.Append(dh.ExecuteXmlReader("spGetCompanyMarketDataXml", CommandType.StoredProcedure, sqlParams));
                    }
                    catch (Exception ex)
                    {
                        result.Append("<MarketData error=\"" + ex.Message + "\"></MarketData>");
                    }
                    try
                    {
                        result.Append(dh.ExecuteXmlReader("spGetCompanyPerformanceXml", CommandType.StoredProcedure, sqlParams));
                    }
                    catch (Exception ex)
                    {
                        result.Append("<Performance error=\"" + ex.Message + "\"></Performance>");
                    }
                    try
                    {
                        result.Append(dh.ExecuteXmlReader("spGetCompanyEpsXml", CommandType.StoredProcedure, sqlParams));
                    }
                    catch (Exception ex)
                    {
                        result.Append("<Eps error=\"" + ex.Message + "\"></Eps>");
                    }
                    try
                    {
                        result.Append(dh.ExecuteXmlReader("spGetCompanyFinancialsXml", CommandType.StoredProcedure, sqlParams));
                    }
                    catch (Exception ex)
                    {
                        result.Append("<Financials error=\"" + ex.Message + "\"></Financials>");
                    }
                    try
                    {
                        result.Append(dh.ExecuteXmlReader("spGetCompanyValuationsXml", CommandType.StoredProcedure, sqlParams));
                    }
                    catch (Exception ex)
                    {
                        result.Append("<Valuations error=\"" + ex.Message + "\"></Valuations>");
                    }
                    result.Append("</CompanyFinancials>");

                    SaveFinancialsDataServiceLog(dh, "GetCompanyFinancials", "instructionXml=" + xml, user);

                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(result.ToString());
                    logger.Info("Method End");
                    return response;
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }
        }


        /// <summary>
        /// Get Ticker Table
        /// </summary>
        /// <param name="payload"></param>
        /// user and xml
        /// <returns></returns>
        ///  
        [Route("api/toolsapi/gettickertable")]
        [HttpPost]
        public HttpResponseMessage GetTickerTable(ToolsPayLoad payload)
        {
            try
            {
                if (payload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                if (string.IsNullOrEmpty(payload.User) || string.IsNullOrEmpty(payload.XmlLoad))
                {
                    logger.Info("Missing Params Bad Request,user:{0}, xmlLoad:{1}", payload.User, payload.XmlLoad);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {

                    string xml = payload.XmlLoad;
                    string user = payload.User;
                    //var qString = request.GetQueryStrings();
                    //string user = string.Empty;
                    //qString.TryGetValue("user", out user);
                    //xml = request.Content.ReadAsStringAsync().Result;

                    logger.Info("Method Requested by {0} and payload: {1}", user, xml);
                    DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString());
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@InXml", xml);
                    StringBuilder result = new StringBuilder();

                    result.Append("<TickerTable>");
                    try
                    {
                        result.Append(dh.ExecuteXmlReader("spGetTickerTableApiXml", CommandType.StoredProcedure, sqlParams));
                    }
                    catch (Exception ex)
                    {
                        result.Append("<Valuations error=\"" + ex.Message + "\"></Valuations>");
                    }
                    result.Append("</TickerTable>");

                    SaveFinancialsDataServiceLog(dh, "SetEstimatesInfo", "instructionXml=" + xml, user);

                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(result.ToString());
                    logger.Info("Method End");
                    return response;

                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }
        }

        /// <summary>
        /// Validate
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        [Route("api/toolsapi/validate")]
        [HttpPost]
        public HttpResponseMessage Validate(ToolsPayLoad payload)
        {
            try
            {
                if (payload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                if (string.IsNullOrEmpty(payload.User) || string.IsNullOrEmpty(payload.XmlLoad))
                {
                    logger.Info("Missing Params Bad Request,user:{0}, xmlLoad:{1}", payload.User, payload.XmlLoad);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    //var qString = request.GetQueryStrings();
                    //string user = string.Empty;
                    //qString.TryGetValue("user", out user);
                    //string xml = request.Content.ReadAsStringAsync().Result;


                    logger.Info("Method Requested by {0}, Payload: {1}", payload.User, payload.XmlLoad);


                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        StringBuilder result = new StringBuilder();
                        SqlParameter[] sqlParams = new SqlParameter[1];
                        sqlParams[0] = new SqlParameter("@InstructionXML", payload.XmlLoad);

                        result.Append("<Root>");
                        result.Append(dh.ExecuteXmlReader("spValidate", CommandType.StoredProcedure, sqlParams));
                        result.Append("</Root>");

                        SaveFinancialsDataServiceLog(dh, "Validate", "instructionXml=" + payload.XmlLoad, payload.User);

                        var response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(result.ToString());
                        logger.Info("Method End");
                        return response;
                    }

                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }

        }

        /// <summary>
        /// Report Annual Earnings
        /// </summary>
        /// <param name="companyId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        [Route("api/toolsapi/reportannualearnings")]
        [HttpPost]
        public HttpResponseMessage ReportAnnualEarnings(ToolsPayLoad payload)
        {
            try
            {
                if (payload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                if (string.IsNullOrEmpty(payload.User) || payload.CompanyId > 0)
                {
                    logger.Info("Missing Params Bad Request,user:{0}, companyid:{1}", payload.User, payload.CompanyId);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {

                    logger.Info("Method Requested by {0} for CompanyId:{1}", payload.User, payload.CompanyId);


                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {

                        SqlParameter[] sqlParams = new SqlParameter[2];
                        sqlParams[0] = new SqlParameter("@CompanyId", payload.CompanyId);
                        sqlParams[1] = new SqlParameter("@UserName", payload.User);

                        var res = dh.ExecuteScalar("spReportActualFY", CommandType.StoredProcedure, sqlParams);

                        SaveFinancialsDataServiceLog(dh, "ReportAnnualEarnings", "companyId=" + payload.CompanyId.ToString(), payload.User);

                        try
                        {
                            logger.Info("RefreshRptoolsXML Initiated by {0}", payload.User);
                            Bernstein.IRS.Jobs.WriteXML oWriteXML = new Bernstein.IRS.Jobs.WriteXML();
                            oWriteXML.RefreshRptoolsXML();
                        }
                        catch (Exception ex)
                        {
                            logger.Error("Exception at Method RefreshRptoolsXML:{0}", ex.Message);
                        }

                        var response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(res.ToString());
                        logger.Info("Method End with result:{0}", res.ToString());
                        return response;
                    }

                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }



        }

        /// <summary>
        /// Report Quarterly Earnings
        /// </summary>
        /// <param name="companyId"></param>
        /// <param name="user"></param>
        /// <returns></returns>
        [Route("api/toolsapi/ReportQuarterlyEarnings")]
        [HttpPost]
        public HttpResponseMessage ReportQuarterlyEarnings(ToolsPayLoad payload)
        {
            try
            {
                if (payload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                if (string.IsNullOrEmpty(payload.User) || payload.CompanyId > 0)
                {
                    logger.Info("Missing Params Bad Request,user:{0}, companyid:{1}", payload.User, payload.CompanyId);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {

                    logger.Info("Method Requested by {0} for CompanyId:{1}", payload.User, payload.CompanyId);


                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {

                        SqlParameter[] sqlParams = new SqlParameter[2];
                        sqlParams[0] = new SqlParameter("@CompanyId", payload.CompanyId);
                        sqlParams[1] = new SqlParameter("@UserName", payload.User);

                        var res = dh.ExecuteScalar("spReportActualFQ", CommandType.StoredProcedure, sqlParams);

                        SaveFinancialsDataServiceLog(dh, "ReportQuarterlyEarnings", "companyId=" + payload.CompanyId.ToString(), payload.User);

                        var response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(res.ToString());
                        logger.Info("Method End with result:{0}", res.ToString());
                        return response;

                    }

                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error Occurred !!!!");
            }



        }

        /// <summary>
        /// Get Impersonation Credentials from config
        /// </summary>
        /// <param name="user"></param>
        /// <returns></returns>
        [Route("api/toolsapi/GetImpersonationCredentials")]
        [HttpGet]
        public HttpResponseMessage GetImpersonationCredentials(string user)
        {
            try
            {
                logger.Info("Method Requested by {0}", user);
                System.Configuration.Configuration oConfig = Bernstein.IRS.Utility.ScbSettings.GetConfigObject();
                string sDomain = oConfig.AppSettings.Settings["Impersonate.Domain"].Value.ToString();
                string sUsername = oConfig.AppSettings.Settings["Impersonate.User"].Value.ToString();
                string sPassword = oConfig.AppSettings.Settings["Impersonate.Password"].Value.ToString();
                string sOutputXML = "<ImpersonateUser user='" + sUsername + "' password='" + sPassword + "' domain='" + sDomain + "' />";
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(sOutputXML);
                logger.Info("Method End");
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                throw ex;
            }
        }



        private void SaveFinancialsDataServiceLog(DataHelper dh, string method, string parameters, string user)
        {
            try
            {
                //SqlParameter[] sqlParams = new SqlParameter[3];
                //sqlParams[0] = new SqlParameter("@Method", method);
                //sqlParams[1] = new SqlParameter("@Parameters", parameters);
                //sqlParams[2] = new SqlParameter("@WindowsLogon", user);

               // dh.ExecuteNonQueryN("spSaveFinancialsDataServiceLog", CommandType.StoredProcedure, sqlParams);
            }
            catch (Exception ex)
            {
                throw;
            }

        }


        /// <summary>
        /// Writing error to log.
        /// </summary>
        /// <param name="request"></param>
        [Route("api/toolsapi/WriteToLog")]
        [HttpGet]
        public HttpResponseMessage WriteToLog(HttpRequestMessage request)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                var re = request.GetHeader("errormsg");
                if (re != null)
                {
                    logger.Info("Errormsg :{0}", re.ToString());
                    string sErrorMsg = re.ToString();
                    sErrorMsg = sErrorMsg.Replace("(br)", "\n");
                    Bernstein.IRS.Log.LogAgent.WriteToLog(CommonFunc.ResearchConnectionString().ToString(), Bernstein.IRS.Log.ErrorLevel.Error, "TickerSheet", sErrorMsg);
                }
                else
                {
                    logger.Error("Method Write to Log :There is no error to write.");
                }

                response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent("Error Logged.");

            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
            }
            return response;
        }
        /// <summary>
        /// Get Eligible Change
        /// </summary>
        /// <param name="request"></param>
        /// <returns></returns>
        /// 

        /// 
        [Route("api/toolsapi/GetEligibleChanges")]
        [HttpPost]
        public HttpResponseMessage GetEligibleChanges([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                var xmlload = objpayload.XmlLoad;
                var user = objpayload.User == null ? "" : objpayload.User;
                if (!string.IsNullOrEmpty(xmlload))
                {
                    logger.Info("Header Params :{0}", xmlload.ToString());
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[1];
                        XmlDocument xDoc = new XmlDocument();
                        xDoc.LoadXml(xmlload);

                        sqlParams[0] = new SqlParameter("@inXml", new SqlXml(new XmlTextReader(xDoc.InnerXml
                                                   , XmlNodeType.Document, null)));

                        string sOutXML = dh.ExecuteXmlReader("spGetEligibleChanges", CommandType.StoredProcedure, sqlParams);
                        response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(sOutXML);

                        string sParameters = "inXml=" + xmlload.ToString();
                        SaveFinancialsDataServiceLog(dh, "geteligiblechanges", sParameters, user.ToString());
                    }

                }
                else
                {
                    logger.Error("There is no data.");
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetEligibleChanges message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }

        }
        /// <summary>
        /// Get Ticker Table Header and Footer.
        /// </summary>
        /// <param name="context"></param>
        [Route("api/toolsapi/GetTickerTableHeaderFooter")]
        [HttpPost]
        public HttpResponseMessage GetTickerTableHeaderFooter([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                var xmlload = objpayload.XmlLoad;
                var user = objpayload.User == null ? "" : objpayload.User;

                if (!string.IsNullOrEmpty(xmlload))
                {
                    logger.Info("Header Params :{0}, Windowslogon : {1}", xmlload.ToString(), user.ToString());
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[1];

                        XmlDocument xDoc = new XmlDocument();
                        xDoc.LoadXml(xmlload);

                        sqlParams[0] = new SqlParameter("@inXml", new SqlXml(new XmlTextReader(xDoc.InnerXml
                                                   , XmlNodeType.Document, null)));
                        string sOutXML = dh.ExecuteXmlReader("spGetTickerTableHeaderFooter", CommandType.StoredProcedure, sqlParams);
                        response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(sOutXML);
                        string sParameters = "inXml=" + xmlload.ToString();
                        SaveFinancialsDataServiceLog(dh, "gettickertableheaderfooter", sParameters, user.ToString());
                    }

                }
                else
                {
                    logger.Error("There is no data.");
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetTickerTableHeaderFooter :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }

        }
        [Route("api/toolsapi/EnqueueForPublication")]
        [HttpPost]
        public HttpResponseMessage EnqueueForPublication([FromBody]ToolsPayLoad payload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                if (payload == null)
                {
                    logger.Info("Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                //string SecurityId = string.Empty, user = string.Empty;


                if (string.IsNullOrEmpty(payload.XmlLoad) || string.IsNullOrEmpty(payload.XmlLoad2) || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("Missing Params Bad Request,XmlLoad:{0}, user:{1}", payload.XmlLoad, payload.User);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    logger.Info("Method Requested by {0} for PublishingXML: {1} DocXML: {2}", payload.User, payload.XmlLoad, payload.XmlLoad2);

                    DataSet dsResult = new DataSet();
                    var headerParams = payload.XmlLoad;
                    var headerParams1 = payload.XmlLoad2;
                    var headerWindowsLogon = payload.User == null ? "" : payload.User;

                    //logger.Info("Header Params :{0}, Header Params1 : {1}, Windowslogon : {2}", headerParams.ToString(), headerParams1.ToString(), headerWindowsLogon.ToString());

                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[2];

                        XmlDocument xDocParams = new XmlDocument();
                        xDocParams.LoadXml(headerParams);

                        XmlDocument xDocParams1 = new XmlDocument();
                        xDocParams1.LoadXml(headerParams1);

                        sqlParams[0] = new SqlParameter("@PublishingXml", new SqlXml(new XmlTextReader(xDocParams.InnerXml
                                                     , XmlNodeType.Document, null)));
                        sqlParams[1] = new SqlParameter("@DocumentXml", new SqlXml(new XmlTextReader(xDocParams1.InnerXml
                                                     , XmlNodeType.Document, null)));


                        dsResult = dh.ExecuteDataSet("spEnqueueForPublication", CommandType.StoredProcedure, sqlParams);
                        if (dsResult.Tables.Count > 0)
                        {

                            if (dsResult.Tables[0].Rows.Count > 0)
                            {
                                string sReturnValue = dsResult.Tables[0].Rows[0]["ReturnValue"].ToString();
                                if (sReturnValue == "0")
                                {
                                    Bernstein.IRS.Utility.FileIO objFile = new FileIO();
                                    XDocument xDoc = XDocument.Parse(headerParams);

                                    string sWordFile = xDoc.Root.Attribute("wordFile").Value;
                                    string sProcessServer = xDoc.Root.Attribute("processServer").Value;

                                    string sKey = "Folder.Path.Publishing.Tmp." + sProcessServer;
                                    Configuration oConfig = Bernstein.IRS.Utility.ScbSettings.GetConfigObject();
                                    string sTmpFilePath = oConfig.AppSettings.Settings[sKey].Value.ToString();
                                    string sPublishingPath = oConfig.AppSettings.Settings["Publishing.Path"].Value.ToString();

                                    objFile.CopyFile(sTmpFilePath + sWordFile, sPublishingPath + dsResult.Tables[0].Rows[0]["QueueId"].ToString() + ".docx");

                                    SqlParameter[] sqlParamsPub = new SqlParameter[4];
                                    sqlParamsPub[0] = new SqlParameter("@QueueId ", CommonFunc.GetDBValue(dsResult.Tables[0].Rows[0]["QueueId"].ToString()));
                                    sqlParamsPub[1] = new SqlParameter("@PubNo ", CommonFunc.GetDBValue(0));
                                    sqlParamsPub[2] = new SqlParameter("@ProcessStatus ", CommonFunc.GetDBValue("Scheduled"));
                                    sqlParamsPub[3] = new SqlParameter("@CanceledBy ", CommonFunc.GetDBValue(null));
                                    dh.ExecuteNonQuery("spUpdateStatusForPublication", CommandType.StoredProcedure, sqlParamsPub);

                                    response.Content = new StringContent(dsResult.Tables[0].Rows[0]["ReturnText"].ToString());
                                }
                                else if (sReturnValue == "-2" || sReturnValue == "-3")
                                {
                                    response.Content = new StringContent(dsResult.Tables[0].Rows[0]["ReturnText"].ToString());
                                }
                                else
                                {
                                    response.Content = new StringContent("Error queueing the report.");
                                }

                                string sParameters = "PublishingXml=" + headerParams.ToString();
                                SaveFinancialsDataServiceLog(dh, "spEnqueueForPublication", sParameters, headerWindowsLogon.ToString());
                            }
                        }
                    }
                    return response;
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at EnqueueForPublication :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }
        [Route("api/toolsapi/EnqueueForPublication")]
        [HttpGet]
        public HttpResponseMessage EnqueueForPublication(HttpRequestMessage request)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                DataSet dsResult = new DataSet();
                var headerParams = request.GetHeader("params");
                var headerParams1 = request.GetHeader("params1");
                var headerWindowsLogon = request.GetHeader("windowsLogon") == null ? "" : request.GetHeader("windowsLogon");

                logger.Info("Header Params :{0}, Header Params1 : {1}, Windowslogon : {2}", headerParams.ToString(), headerParams1.ToString(), headerWindowsLogon.ToString());

                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[2];

                    XmlDocument xDocParams = new XmlDocument();
                    xDocParams.LoadXml(headerParams);

                    XmlDocument xDocParams1 = new XmlDocument();
                    xDocParams1.LoadXml(headerParams1);

                    sqlParams[0] = new SqlParameter("@PublishingXml", new SqlXml(new XmlTextReader(xDocParams.InnerXml
                                                 , XmlNodeType.Document, null)));
                    sqlParams[1] = new SqlParameter("@DocumentXml", new SqlXml(new XmlTextReader(xDocParams1.InnerXml
                                                 , XmlNodeType.Document, null)));


                    dsResult = dh.ExecuteDataSet("spEnqueueForPublication", CommandType.StoredProcedure, sqlParams);
                    if (dsResult.Tables.Count > 0)
                    {

                        if (dsResult.Tables[0].Rows.Count > 0)
                        {
                            string sReturnValue = dsResult.Tables[0].Rows[0]["ReturnValue"].ToString();
                            if (sReturnValue == "0")
                            {
                                Bernstein.IRS.Utility.FileIO objFile = new FileIO();
                                XDocument xDoc = XDocument.Parse(headerParams);

                                string sWordFile = xDoc.Root.Attribute("wordFile").Value;
                                string sProcessServer = xDoc.Root.Attribute("processServer").Value;

                                string sKey = "Folder.Path.Publishing.Tmp." + sProcessServer;
                                Configuration oConfig = Bernstein.IRS.Utility.ScbSettings.GetConfigObject();
                                string sTmpFilePath = oConfig.AppSettings.Settings[sKey].Value.ToString();
                                string sPublishingPath = oConfig.AppSettings.Settings["Publishing.Path"].Value.ToString();

                                objFile.CopyFile(sTmpFilePath + sWordFile, sPublishingPath + dsResult.Tables[0].Rows[0]["QueueId"].ToString() + ".docx");

                                SqlParameter[] sqlParamsPub = new SqlParameter[4];
                                sqlParamsPub[0] = new SqlParameter("@QueueId ", CommonFunc.GetDBValue(dsResult.Tables[0].Rows[0]["QueueId"].ToString()));
                                sqlParamsPub[1] = new SqlParameter("@PubNo ", CommonFunc.GetDBValue(0));
                                sqlParamsPub[2] = new SqlParameter("@ProcessStatus ", CommonFunc.GetDBValue("Scheduled"));
                                sqlParamsPub[3] = new SqlParameter("@CanceledBy ", CommonFunc.GetDBValue(null));
                                dh.ExecuteNonQuery("spUpdateStatusForPublication", CommandType.StoredProcedure, sqlParamsPub);

                                response.Content = new StringContent(dsResult.Tables[0].Rows[0]["ReturnText"].ToString());
                            }
                            else if (sReturnValue == "-2" || sReturnValue == "-3")
                            {
                                response.Content = new StringContent(dsResult.Tables[0].Rows[0]["ReturnText"].ToString());
                            }
                            else
                            {
                                response.Content = new StringContent("Error queueing the report.");
                            }

                            string sParameters = "PublishingXml=" + headerParams.ToString();
                            SaveFinancialsDataServiceLog(dh, "spEnqueueForPublication", sParameters, headerWindowsLogon.ToString());
                        }
                    }
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at EnqueueForPublication :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        /// <summary>
        /// RefreshModel will copy model from draft to live repository
        /// </summary>
        /// <param name="payload"></param>
        ///  Source and User
        /// <returns></returns>

        [Route("api/toolsapi/refreshmodel")]
        [HttpPost]
        public HttpResponseMessage RefreshModel([FromBody]ToolsPayLoad payload)
        {
            try
            {
                //System.Web.HttpUtility.UrlEncode();

                if (payload == null)
                {
                    logger.Info("Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                //string SecurityId = string.Empty, user = string.Empty;


                if (string.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("Missing Params Bad Request,XmlLoad:{0}, user:{1}", payload.XmlLoad, payload.User);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    logger.Info("Method Requested by {0} for XmlLoad: {1}", payload.User, payload.XmlLoad);
                    int iCounterVal = 0;

                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[2];
                        sqlParams[0] = new SqlParameter("@CounterName", "ModelId");
                        sqlParams[1] = new SqlParameter("@CounterValue", CommonFunc.GetDBValue(0));
                        sqlParams[1].Direction = ParameterDirection.Output;

                        dh.ExecuteNonQuery("spReserveCounter", CommandType.StoredProcedure, sqlParams);
                        int.TryParse(sqlParams[1].Value.ToString(),out iCounterVal);
                    }

                    //promote draft model with the ticker.xls* to prod folder
                    Configuration oConfig = ScbSettings.GetConfigObject();
                    string sfolderPath = oConfig.AppSettings.Settings["Folder.Path.Model.Draft"].Value.ToString();
                    string sLinksPath = oConfig.AppSettings.Settings["Beehive.File.Path"].Value.ToString();


                    XDocument xDoc = XDocument.Parse(payload.XmlLoad);
                    string sFile = xDoc.Root.Attribute("fileName").Value;
                    string sSecurityId = xDoc.Root.Attribute("id").Value;
                    string sTicker = xDoc.Root.Attribute("name").Value.Replace(@"/", "_");
                    string sCoverageId = xDoc.Root.Attribute("coverageId").Value;
                    string sActionId = xDoc.Root.Attribute("actionId").Value;
                    string sUserName = xDoc.Root.Attribute("userName").Value;
                    string sFilePath = xDoc.Root.Attribute("originalFilePath").Value;
                    
                    sFile = sFile.Substring(sFile.LastIndexOf(@"\") + 1);
                    string sExt = sFile.Substring(sFile.LastIndexOf('.') + 1);

                    Bernstein.IRS.Utility.Impersonation.Impersonate();
                    Bernstein.IRS.Utility.FileIO objFile = new FileIO();
                    if (objFile.FileExists(sfolderPath + "BERN_" + sTicker + '.' + sExt))
                    {
                        objFile.MoveFile(sfolderPath + "BERN_" + sTicker + '.' + sExt, sLinksPath + @"\links\models\" + iCounterVal.ToString() + '.' + sExt);
                    }
                    else
                    {
                        objFile.MoveFile(sfolderPath + sTicker + '.' + sExt, sLinksPath + @"\links\models\" + iCounterVal.ToString() + '.' + sExt);
                    }

                    Bernstein.IRS.Utility.Impersonation.Revert();

                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {

                        SqlParameter[] sqlParams = new SqlParameter[9];
                        sqlParams[0] = new SqlParameter("@ModelId", iCounterVal);
                        sqlParams[1] = new SqlParameter("@SecurityId", sSecurityId);
                        sqlParams[2] = new SqlParameter("@CoverageId", sCoverageId);
                        sqlParams[3] = new SqlParameter("@PubNo", DBNull.Value);
                        sqlParams[4] = new SqlParameter("@FileName", iCounterVal.ToString() + '.' + sExt);
                        sqlParams[5] = new SqlParameter("@FileNameOrig", sFilePath);
                        sqlParams[6] = new SqlParameter("@FileSize", objFile.GetFileSize(sLinksPath + @"\links\models\" + iCounterVal.ToString() + '.' + sExt));
                        sqlParams[7] = new SqlParameter("@ActionId", sActionId);
                        sqlParams[8] = new SqlParameter("@UserName", sUserName);

                        var res = dh.ExecuteScalar("spSaveModel", CommandType.StoredProcedure, sqlParams);

                        string sParameters = "PayloadXml=" + payload.XmlLoad;
                        SaveFinancialsDataServiceLog(dh, "RefreshModel", sParameters, payload.User);
                        //DistributeModel(dh, "", ,);

                        if (res != null && !string.IsNullOrEmpty(res.ToString()))
                        {
                            var response = new HttpResponseMessage(HttpStatusCode.OK);
                            response.Content = new StringContent(res.ToString());
                            logger.Info("Method End");
                            return response;
                        }
                        else
                        {
                            logger.Info("Method Requested by {0} , Payload: {2} is bad Request",payload.User, payload.XmlLoad);
                            return new HttpResponseMessage(HttpStatusCode.BadRequest);
                        }
                    }

                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error processing request");
            }
        }

        /// <summary>
        /// GetFinancialValue will retrieve the financial value for ticker, estimatetype & year
        /// </summary>
        /// <param name="payload"></param>
        ///  Source and User
        /// <returns></returns>
        [Route("api/toolsapi/GetFinancialValue")]
        [HttpPost]
        public HttpResponseMessage GetFinancialValue([FromBody]ToolsPayLoad payload)
        {
            try
            {
                if (payload == null)
                {
                    logger.Info("Method Requested by is Bad Request Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                if (string.IsNullOrEmpty(payload.XmlLoad) || String.IsNullOrEmpty(payload.User))
                {
                    logger.Info("Missing Params Bad Request,XmlLoad:{0}, user:{1}", payload.XmlLoad, payload.User);
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Missing Params!");
                }
                else
                {
                    logger.Info("Method Requested by {0} for XmlLoad: {1}", payload.User, payload.XmlLoad);
                    XDocument xDoc = XDocument.Parse(payload.XmlLoad);
                    string sTicker = xDoc.Root.Attribute("ticker").Value;
                    string sFinancialNumberType = xDoc.Root.Attribute("financialNumberType").Value;
                    string sYear = xDoc.Root.Attribute("year").Value.Replace(@"/", "_");

                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[3];
                        sqlParams[0] = new SqlParameter("@Ticker", sTicker);
                        sqlParams[1] = new SqlParameter("@FinancialNumberType", sFinancialNumberType);
                        sqlParams[2] = new SqlParameter("@Year", sYear);
                        var res = dh.ExecuteScalar("spGetFinancialValue", CommandType.StoredProcedure, sqlParams);

                        string sParameters = "PayloadXml=" + payload.XmlLoad;
                        SaveFinancialsDataServiceLog(dh, "GetFinancialValue", sParameters, payload.User);

                        if (res != null && !string.IsNullOrEmpty(res.ToString()))
                        {
                            var response = new HttpResponseMessage(HttpStatusCode.OK);
                            response.Content = new StringContent(res.ToString());
                            logger.Info("Method End");
                            return response;
                        }
                        else
                        {
                            logger.Info("Method Requested by {0} , Payload: {2} is bad Request", payload.User, payload.XmlLoad);
                            return new HttpResponseMessage(HttpStatusCode.BadRequest);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at Method message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Error processing request");
            }
        }
        [Route("api/toolsapi/GetFolderInfo")]
        [HttpGet]        
        public HttpResponseMessage GetFolderInfo(HttpRequestMessage request)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
               
                string sKey = request.GetHeader("params");
                var headerWindowsLogon = request.GetHeader("windowsLogon") == null ? "" : request.GetHeader("windowsLogon");
                logger.Info("Header Params :{0}, Windowslogon : {1}", sKey, headerWindowsLogon);


                System.Configuration.Configuration oConfig = Bernstein.IRS.Utility.ScbSettings.GetConfigObject();
                string sTmpFilePath = oConfig.AppSettings.Settings["Beehive.File.Path"]?.Value.ToString();


                string sDomain = oConfig.AppSettings.Settings["Impersonate.Domain"].Value.ToString();
                string sUsername = oConfig.AppSettings.Settings["Impersonate.User"].Value.ToString();
                string sPassword = oConfig.AppSettings.Settings["Impersonate.Password"].Value.ToString();
                string sOutputXML = "<Folder path='" + sTmpFilePath + "' user='" + sUsername + "' password='" + sPassword + "' domain='" + sDomain + "' />";
                response.Content = new StringContent(sOutputXML);

                //Log the request

                SaveFinancialsDataServiceLog(new DataHelper(CommonFunc.ResearchConnectionString()), "GetFolderInfo", sKey, headerWindowsLogon.ToString());
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetFolderInfo :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/GetTickerList")]
        [HttpPost]
        public HttpResponseMessage GetTickerList([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                var user = objpayload.User == null ? "" : objpayload.User;

                if (!string.IsNullOrEmpty(user.Trim()))
                {

                    logger.Info("Windowslogon : {0}", user.ToString());

                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        string sOutXML = dh.ExecuteXmlReader("spGetTickerListXml", CommandType.StoredProcedure);
                        response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(sOutXML);
                        //Log the request

                        SaveFinancialsDataServiceLog(dh, "spGetTickerListXml", ",", user.ToString());
                    }
                }
                else
                {
                    logger.Error("User name is blank.");
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetTickerList :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/GetReportState")]
        [HttpPost]
        public HttpResponseMessage GetReportState([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                string xmlload = objpayload.XmlLoad;
                var user = objpayload.User == null ? "" : objpayload.User;

                logger.Info("Header Params :{0},  Windowslogon : {1}", xmlload.ToString(), user.ToString());

                if (!string.IsNullOrEmpty(xmlload))
                {
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[2];

                        XmlDocument xDocParams = new XmlDocument();
                        xDocParams.LoadXml(xmlload);

                        sqlParams[0] = new SqlParameter("@DocumentXml", new SqlXml(new XmlTextReader(xDocParams.InnerXml
                                                    , XmlNodeType.Document, null)));
                        sqlParams[1] = new SqlParameter("@Operation", CommonFunc.GetDBValue("GET"));

                        string sOutXML = dh.ExecuteXmlReader("spGetReportState", CommandType.StoredProcedure, sqlParams);
                        response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(sOutXML);
                        //Log the request
                        string sParameters = "DocumentXml=" + xmlload + "','GET'";
                        SaveFinancialsDataServiceLog(dh, "spGetTickerSheetIdData", sParameters, user.ToString());
                    }
                }
                else
                {
                    logger.Error("Payload XML can not be blank.");
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetReportState :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/CheckReportState")]
        [HttpPost]
        public HttpResponseMessage CheckReportState([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                string xmlload = objpayload.XmlLoad;
                var user = objpayload.User == null ? "" : objpayload.User;

                logger.Info("Header Params :{0},  Windowslogon : {1}", xmlload.ToString(), user.ToString());

                if (!string.IsNullOrEmpty(xmlload))
                {
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[2];
                        XmlDocument xDocParams = new XmlDocument();
                        xDocParams.LoadXml(xmlload);

                        sqlParams[0] = new SqlParameter("@DocumentXml", new SqlXml(new XmlTextReader(xDocParams.InnerXml
                                                    , XmlNodeType.Document, null)));
                        sqlParams[1] = new SqlParameter("@Operation", CommonFunc.GetDBValue("CHECK"));
                        string sOutXML = dh.ExecuteXmlReader("spGetReportState", CommandType.StoredProcedure, sqlParams);
                        response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(sOutXML);
                        //Log the request
                        string sParameters = "DocumentXml=" + xmlload + "','CHECK'";
                        SaveFinancialsDataServiceLog(dh, "spGetReportState", sParameters, user.ToString());
                    }
                }
                else
                {
                    logger.Error("Payload XML can not be blank.");
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
                }
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetReportState :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/CheckForResubmits")]
        [HttpPost]
        public HttpResponseMessage CheckForResubmits([FromBody] ToolsPayLoad objpayload)
        {

            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                var Date = objpayload.Date;
                var Type = objpayload.Type;
                var Title = objpayload.Title.Replace("'", "''");
                var headerWindowsLogon = objpayload.User == null ? "" : objpayload.User;

                logger.Info("Header Params :{0},Params1 : {1}, Params2 : {2} , Windowslogon : {3}", Date.ToString(), Type, ToString(), Title.ToString(), headerWindowsLogon.ToString());


                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[5];
                    sqlParams[0] = new SqlParameter("@Date", CommonFunc.GetDBValue(Date));
                    sqlParams[1] = new SqlParameter("@Type", CommonFunc.GetDBValue(Type));
                    sqlParams[2] = new SqlParameter("@Title", CommonFunc.GetDBValue(Title));
                    sqlParams[3] = new SqlParameter("@PubNo", CommonFunc.GetDBValue(0));
                    sqlParams[3].Direction = ParameterDirection.Output;
                    sqlParams[4] = new SqlParameter("@Version", CommonFunc.GetDBValue(0));
                    sqlParams[4].Direction = ParameterDirection.Output;

                    dh.ExecuteNonQuery("spCheckForResubmits", CommandType.StoredProcedure, sqlParams);
                    response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(sqlParams[3].Value.ToString());
                    //Log the request
                    string sParameters = "Parameters=" + Date + "," + Type + "," + Title;
                    SaveFinancialsDataServiceLog(dh, "spCheckForResubmits", sParameters, headerWindowsLogon.ToString());
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at CheckForResubmits :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }
        [Route("api/toolsapi/GetReportTickers")]
        [HttpPost]
        public HttpResponseMessage GetReportTickers([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);

            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }

                var PubNo = objpayload.PubNo;
                var user = objpayload.User == null ? "" : objpayload.User;

                logger.Info("Header Params :{0},  Windowslogon : {1}", PubNo.ToString(), user.ToString());

                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@PubNo", CommonFunc.GetDBValue(PubNo));
                    string sOutXML = dh.ExecuteXmlReader("spGetReportTickers", CommandType.StoredProcedure, sqlParams);
                    response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(sOutXML);
                    //Log the request
                    string sParameters = "Parameters=" + PubNo;
                    SaveFinancialsDataServiceLog(dh, "spGetReportTickers", sParameters, user.ToString());
                }
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetReportTickers :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/GetAuthorAvailable")]
        [HttpPost]
        public HttpResponseMessage GetAuthorAvailable([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                DataSet ds = new DataSet();
                string strAuthorsAvailable = string.Empty;
                StringBuilder strBuilder = new StringBuilder();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    ds = dh.ExecuteDataSet("spResearchCoverage", CommandType.StoredProcedure);
                    DataTable dt = new DataTable();
                    dt = ds.Tables[0];

                    response = new HttpResponseMessage(HttpStatusCode.OK);
                    strBuilder.Append("<Industries>");
                    foreach (DataRow dr in dt.Rows)
                    {
                        strBuilder.Append(dr[0].ToString());

                    }
                    strBuilder.Append("</Industries>");
                    response.Content = new StringContent(strBuilder.ToString());

                    SaveFinancialsDataServiceLog(dh, "spResearchCoverage", "", "");
                }
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetAuthorAvailable :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/GetAssociateAvailable")]
        [HttpPost]
        public HttpResponseMessage GetAssociateAvailable([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                DataSet ds = new DataSet();
                string strAuthorsAvailable = string.Empty;
                StringBuilder strBuilder = new StringBuilder();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    ds = dh.ExecuteDataSet("spAssociateXML", CommandType.StoredProcedure);
                    DataTable dt = new DataTable();
                    dt = ds.Tables[0];

                    response = new HttpResponseMessage(HttpStatusCode.OK);
                    strBuilder.Append("<Associates>");
                    foreach (DataRow dr in dt.Rows)
                    {
                        strBuilder.Append(dr[0].ToString());

                    }
                    strBuilder.Append("</Associates>");
                    response.Content = new StringContent(strBuilder.ToString());

                    SaveFinancialsDataServiceLog(dh, "spAssociateXML", "", "");
                }
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetAssociateAvailable :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/GetSCBSetting")]
        [HttpPost]
        public HttpResponseMessage GetSCBSetting([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                DataSet ds = new DataSet();
                string strSCBSetting = string.Empty;
                StringBuilder strBuilder = new StringBuilder();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    ds = dh.ExecuteDataSet("spscbsettingsXML", CommandType.StoredProcedure);
                    DataTable dt = new DataTable();
                    dt = ds.Tables[0];

                    response = new HttpResponseMessage(HttpStatusCode.OK);
                    strBuilder.Append("<SCBToolsSettings>");
                    foreach (DataRow dr in dt.Rows)
                    {
                        strBuilder.Append(dr[0].ToString());

                    }
                    strBuilder.Append("</SCBToolsSettings>");
                    response.Content = new StringContent(strBuilder.ToString());

                    SaveFinancialsDataServiceLog(dh, "spscbsettingsXML", "", "");
                }
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetSCBSetting :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/GetbrUrlXML")]
        [HttpPost]
        public HttpResponseMessage GetbrUrlXML([FromBody] ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            try
            {
                DataSet ds = new DataSet();
                string strbrUrl = string.Empty;
                StringBuilder strBuilder = new StringBuilder();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    ds = dh.ExecuteDataSet("spbrUrlXML", CommandType.StoredProcedure);
                    DataTable dt = new DataTable();
                    dt = ds.Tables[0];

                    response = new HttpResponseMessage(HttpStatusCode.OK);
                    strBuilder.Append("<BRUrl>");
                    foreach (DataRow dr in dt.Rows)
                    {
                        strBuilder.Append(dr[0].ToString());

                    }
                    strBuilder.Append("</BRUrl>");
                    response.Content = new StringContent(strBuilder.ToString());

                    SaveFinancialsDataServiceLog(dh, "spbrUrlXML", "", "");
                }
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetSCBSetting :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

        [Route("api/toolsapi/GetDisclosures")]
        [HttpPost]
        public HttpResponseMessage GetDisclosures(ToolsPayLoad objpayload)
        {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.OK);
            System.Configuration.Configuration oConfig = ScbSettings.GetConfigObject();
            try
            {
                if (objpayload == null)
                {
                    logger.Info("Method Requested is Bad Request: Params Null");
                    return new HttpResponseMessage(HttpStatusCode.BadRequest);
                }
                string xmlload = objpayload.XmlLoad;
                var user = objpayload.User == null ? "" : objpayload.User;

                logger.Info("Header Params :{0},  Windowslogon : {1}", xmlload.ToString(), user.ToString());

                if (!string.IsNullOrEmpty(xmlload))
                {

                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {

                        SqlParameter[] sqlParams = new SqlParameter[1];
                        XmlDocument xDoc = new XmlDocument();
                        xDoc.LoadXml(xmlload);

                        sqlParams[0] = new SqlParameter("@DocumentXml", new SqlXml(new XmlTextReader(xDoc.InnerXml
                                                   , XmlNodeType.Document, null)));

                        DataSet dsDisclosures = dh.ExecuteDataSet("spGetDisclosures", CommandType.StoredProcedure, sqlParams);

                        string sPath = oConfig.AppSettings.Settings["Disclosures_Path"].Value.ToString();

                        string sRating = string.Empty;
                        string sRatingCount = string.Empty;
                        string sRatingPercent = string.Empty;
                        string sRatingBankingClientPercent = string.Empty;

                        Impersonation.Impersonate();
                        string text = File.ReadAllText(sPath);
                        Impersonation.Revert();
                        //Date and Year
                        DateTime aDate = DateTime.Now;
                        text = text.Replace("(DATE)", aDate.ToString("MM/dd/yyyy"));
                        text = text.Replace("(YEAR)", aDate.ToString("yyyy"));

                        string sAnalystList = dsDisclosures.Tables[0].Rows[0]["AnalystList"].ToString();
                        text = text.Replace("(ANALYST)", sAnalystList);
                        string sAuthorTextDisclosures = string.Empty;
                        if (!CommonFunc.IsDBNull(dsDisclosures.Tables[2].Rows[0]["AuthorTextDisclosures"].ToString()))
                        {
                            sAuthorTextDisclosures = dsDisclosures.Tables[2].Rows[0]["AuthorTextDisclosures"].ToString();
                        }
                        text = text.Replace("(AUTHORTEXTDISCLOSURES)", sAuthorTextDisclosures);

                        string sAuthorHoldings = string.Empty;
                        if (!CommonFunc.IsDBNull(dsDisclosures.Tables[3].Rows[0]["AuthorHoldings"].ToString()))
                        {
                            sAuthorHoldings = dsDisclosures.Tables[3].Rows[0]["AuthorHoldings"].ToString();
                        }
                        text = text.Replace("(AUTHORHOLDINGS)", sAuthorHoldings);

                        string sSecurityTextDisclosures = string.Empty;
                        if (!CommonFunc.IsDBNull(dsDisclosures.Tables[4].Rows[0]["SecurityTextDisclosures"].ToString()))
                        {
                            sSecurityTextDisclosures = dsDisclosures.Tables[4].Rows[0]["SecurityTextDisclosures"].ToString();
                        }
                        text = text.Replace("(SECURITYTEXTDISCLOSURES)", sSecurityTextDisclosures);

                        string sOwnershipDisclosures = string.Empty;
                        if (!CommonFunc.IsDBNull(dsDisclosures.Tables[5].Rows[0]["OwnershipDisclosures"].ToString()))
                        {
                            sOwnershipDisclosures = dsDisclosures.Tables[5].Rows[0]["OwnershipDisclosures"].ToString();
                        }
                        text = text.Replace("(OWNERSHIPDISCLOSURES)", sOwnershipDisclosures);

                        foreach (DataRow dr in dsDisclosures.Tables[1].Rows)
                        {
                            sRating = dr[0].ToString();
                            sRatingCount = dr[1].ToString();
                            sRatingPercent = dr[2].ToString();
                            sRatingBankingClientPercent = dr[4].ToString();

                            if (sRating == "O")
                            {
                                text = text.Replace("(OUTPERFORMRATINGCOUNT)", sRatingCount);
                                text = text.Replace("(OUTPERFORM)", sRatingPercent);
                                text = text.Replace("(OUTPERFORMBANKINGCLIENT)", sRatingBankingClientPercent);
                            }
                            if (sRating == "M")
                            {
                                text = text.Replace("(MARKETPERFORMRATINGCOUNT)", sRatingCount);
                                text = text.Replace("(MARKETPERFORM)", sRatingPercent);
                                text = text.Replace("(MARKETPERFORMBANKINGCLIENT)", sRatingBankingClientPercent);
                            }
                            if (sRating == "U")
                            {
                                text = text.Replace("(UNDERPERFORMRATINGCOUNT)", sRatingCount);
                                text = text.Replace("(UNDERPERFORM)", sRatingPercent);
                                text = text.Replace("(UNDERPERFORMBANKINGCLIENT)", sRatingBankingClientPercent);
                            }
                            if (sRating == "N")
                            {
                                text = text.Replace("(NOTRATEDRATINGCOUNT)", sRatingCount);
                                text = text.Replace("(NOTRATED)", sRatingPercent);
                                text = text.Replace("(NOTRATEDBANKINGCLIENT)", sRatingBankingClientPercent);
                            }
                            
                        }
                        string sRatingHistory = dsDisclosures.Tables[6].Rows[0]["RatingHistoryTable"].ToString();
                        text = text.Replace("(RATINGSTABLE)", sRatingHistory);


                        response = ControllerContext.Request.CreateResponse(HttpStatusCode.OK);
                        response.Content = new StringContent(text);
                        //response.Content = new StringContent(new { dsDisclosures.Tables[0] });
                        //Log the request

                        SaveFinancialsDataServiceLog(dh, "spGetDisclosures", ",", user.ToString());
                    }
                }
                else
                {
                    logger.Error("User name is blank.");
                    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
                }
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spGetDisclosures :{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }
        }

    }

}
