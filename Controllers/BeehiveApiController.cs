using Bernstein.IRS.Beehive.Models;
using Bernstein.IRS.Data;
using Bernstein.IRS.Utility;
//using Endeca.Navigation;
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
using System.Xml;
using Bernstein.IRS.Beehive.Api.Utility;
using System.Threading.Tasks;
using Research = Bernstein.IRS.ElasticModels.Research;
using System.IO;
using System.Net.Http.Headers;
using Bernstein.IRS.ElasticModels;
using Bernstein.IRS.Utility.Authentication;
using System.Web.Configuration;
using System.Xml.XPath;
using System.Web.UI.WebControls;
using System.Web.Script.Serialization;
using System.ServiceProcess;
using System.Configuration;
using System.Net.Sockets;
using Bernstein.IRS.Utility;
using Bernstein.IRS.Web.Auth;
using Bernstein.IRS.Web.Helpers;
using Newtonsoft.Json.Linq;

namespace Bernstein.IRS.Beehive.Api.Controllers
{
   // [JwtAuthentication]
    //[EnableCors(origins: "*", headers: "*", methods: "*", SupportsCredentials = true)]
    public class BeehiveApiController : ApiController
    {
        private static Logger logger = LogManager.GetLogger("BehiveServiceLog");
        private static string SearchSize = System.Configuration.ConfigurationManager.AppSettings["Elastic.RecordSize"];

        /// <summary>
        /// Get SearchData for lookup/Typeahead
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public HttpResponseMessage getSearchAutocomplete(string text)
        {

            string ip = Request.GetClientIpAddress();
            //((string[])(Request.Headers.GetValues("params1")))[0]
            try
            {
                logger.Info("getSearchAutocomplete request by {0} for {1} text", ip, text);
                string company = string.Empty;
                //if (text.Contains('/'))
                //{
                //    var split = text.Split('/');
                //    text = split[0].Trim();
                //    company = split[1].Trim();
                //}
                //else
                //    company = text;

                //text=text.Replace("/", "//");

                DataTable dtSearchResult = new DataTable(); 
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@SearchText", text);

                    dtSearchResult = dh.ExecuteDataTable("spSearchAutoComplete", CommandType.StoredProcedure, sqlParams);
                }

                //clsDataLayer db = new clsDataLayer();
                //var res = db.Execute("sp_SearchData 0,0,'" + text + "','" + company + "'");
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(dtSearchResult.DataTableToJson());
                logger.Info("getSearchData request end by {0}", ip);
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getSearchData message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        /// <summary>
        /// Get SearchData for lookup/Typeahead.
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public HttpResponseMessage getModels(string type, string filter)
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

                    SqlParameter[] sqlParams = new SqlParameter[4];
                    sqlParams[0] = new SqlParameter("@Type", type);
                    sqlParams[1] = new SqlParameter("@OrderBy", "");
                    sqlParams[2] = new SqlParameter("@OrderType", "");
                    sqlParams[3] = new SqlParameter("@SearchCriteria", filter == null ? string.Empty : filter);

                    dtSearchResult = dh.ExecuteDataTable("spGetModels", CommandType.StoredProcedure, sqlParams);
                }

                //clsDataLayer db = new clsDataLayer();
                //var res = db.Execute("sp_SearchData 0,0,'" + text + "','" + company + "'");
                //dtSearchResult = dtSearchResult.Rows.Cast<System.Data.DataRow>().Take(20).CopyToDataTable();
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(dtSearchResult.DataTableToJson());
                logger.Info("getModelData request end by {0}", ip);
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getModelData message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        /// <summary>
        /// Get SearchData for lookup/Typeahead
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        public HttpResponseMessage getRenderModelDropDown(string styleid, string userid)
        {

            string ip = Request.GetClientIpAddress();
            try
            {
                //logger.Info("getSearchData request by {0} for {1} text", ip, text);
                string company = string.Empty;

                DataSet dtSearchResult = new DataSet();
                string data = string.Empty;

                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[3];
                    sqlParams[0] = new SqlParameter("@Style", styleid);
                    sqlParams[1] = new SqlParameter("@UserId", userid);
                    sqlParams[2] = new SqlParameter("@AnalystId", "");

                    dtSearchResult = dh.ExecuteDataSet("spRenderModelDropDown", CommandType.StoredProcedure, sqlParams);
                }


                foreach (DataTable dt in dtSearchResult.Tables)
                {
                    if (string.IsNullOrEmpty(data))
                        data += "{data:{region:" + dt.DataTableToJson();
                    else
                    {
                        string name = dt.TableName.ToLower() == "table1" ? "analyst:" : "ticker:";
                        data += "," + name + dt.DataTableToJson();
                    }
                }
                data += "}}";

                var val = Newtonsoft.Json.JsonConvert.DeserializeObject(data);

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(val.ToString());
                logger.Info("getRenderModelDropDown request end by {0}", ip);
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getRenderModelDropDown message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        [HttpGet]
        public IHttpActionResult getPickList(string list, int? style)
        {
            string field = list.ToLower();
            string executeSp = "";
            SqlParameter[] sqlParams = null;

            if (style.HasValue)
            {
                sqlParams = new SqlParameter[1];
                sqlParams[0] = new SqlParameter("@Style", style.Value);
            }


            switch (field)
            {
                case "ticker":
                    executeSp = "spPickTickers";
                    break;
                case "industry":
                    executeSp = "spPickIndustries";
                    break;
                case "type":
                    executeSp = "spPickTypes";
                    break;              
                case "author":
                    executeSp = "spPickAuthors";
                    break;
                case "subtype":
                    executeSp = "spPickSubTypes";
                    break;
                case "keyword":
                    executeSp = "spPickKeywords";
                    break;
                case "investorthemes":
                    executeSp = "spPickInvestorThemes";
                    break;
                case "thematictag":
                    executeSp = "spPickThematicTags";
                    break;                
                case "actiontag":
                    executeSp = "spPickActionTags";
                    break;
                case "research":
                    executeSp = "spPickResearch";
                    break;
                case "industryscreen":
                    executeSp = "spPickIndustryScreen";
                    break;
                case "securityscreen":
                    executeSp = "spPickSecurityScreen";
                    break;

            }

            
            try
            {  

                if(field=="research")
                {
                    DataTable dtResult = new DataTable();
                    using (DataHelper datahelper = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParamsval = new SqlParameter[0];
                        DataSet ds = datahelper.ExecuteDataSet(executeSp, CommandType.StoredProcedure, sqlParamsval);
                        var type = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());
                        var focus = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[1].DataTableToJson());
                        var keyword = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[2].DataTableToJson());
                        var investorthemes = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[3].DataTableToJson());
                        var thematictag = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[4].DataTableToJson());
                        var industries = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[5].DataTableToJson());
                        var analysts = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[6].DataTableToJson());
                        var tickers = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[7].DataTableToJson());
                        var action = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[8].DataTableToJson());
                        var authors = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[9].DataTableToJson());
                        return this.Ok(
                            new
                            {
                                Types = type,
                                SubTypes = focus,
                                Keywords = keyword,
                                InvestorThemes = investorthemes,
                                ThematicTags = thematictag,
                                Industries = industries,
                                Analysts = analysts,
                                Tickers = tickers,
                                ActionTags = action,
                                Authors=authors

                            }
                        );
                    }
                }
                else if (field == "industryscreen")
                {
                    DataTable dtResult = new DataTable();
                    using (DataHelper datahelper = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParamsval = new SqlParameter[0];
                        DataSet ds = datahelper.ExecuteDataSet(executeSp, CommandType.StoredProcedure, sqlParamsval);
                        var sectors = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());
                        var industrytypes = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[1].DataTableToJson());
                        var types = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[2].DataTableToJson());
                        return this.Ok(
                            new
                            {
                                Sectors = sectors,
                                IndustryTypes = industrytypes,
                                Types=types
                            }
                        );
                    }
                }
                else if (field == "securityscreen")
                {
                    DataTable dtResult = new DataTable();
                    using (DataHelper datahelper = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParamsval = new SqlParameter[0];
                        DataSet ds = datahelper.ExecuteDataSet(executeSp, CommandType.StoredProcedure, sqlParamsval);
                        var companies = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());
                        var securitytypes = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[1].DataTableToJson());
                        var exchanges = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[2].DataTableToJson());
                        var currencies = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[3].DataTableToJson());
                        var indexes = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[4].DataTableToJson());
                        var countries = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[5].DataTableToJson());
                        var regions = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[6].DataTableToJson());
                        var gics = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[7].DataTableToJson());
                        var securitycompanies = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[8].DataTableToJson());
                        
                        return this.Ok(
                            new
                            {
                                Companies = companies,
                                SecurityTypes = securitytypes,
                                Exchanges = exchanges,
                                Currencies = currencies,
                                Indexes = indexes,
                                Countries = countries,
                                Regions = regions,
                                GICS = gics,
                                SecurityCompanies = securitycompanies
                            }
                        );
                    }
                }
                else
                {
                    DataTable dtSearchResult = new DataTable();
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        dtSearchResult = dh.ExecuteDataTable(executeSp, CommandType.StoredProcedure, sqlParams);
                    }
                    return Ok(dtSearchResult);
                }
            }
            catch (Exception e)
            {
                string url = Request.RequestUri.GetLeftPart(UriPartial.Authority);
                
                DBLogger.Error("Beehive", "getPickList", "HttpGet", "Beehive",
                               e.Message, "string "+ list + "style "+ style, url, "");
                logger.Error("Exception at GetPickList message:{0}", e.Message);
                return BadRequest(e.Message);
            }



        }

        [Route("api/beehive/GetPickLists/")]
        [HttpGet]
        public IHttpActionResult GetPickLists()
        { 
            try
            {
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[0];
                    DataSet ds = dh.ExecuteDataSet("spPickResearch", CommandType.StoredProcedure, sqlParams);
                    var type = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());
                    var focus = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[1].DataTableToJson());
                    var keyword = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[2].DataTableToJson());
                    var investorthemes = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[3].DataTableToJson());
                    var thematictag = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[4].DataTableToJson());
                    var industries = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[5].DataTableToJson());
                    var analysts = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[6].DataTableToJson());
                    var tickers = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[7].DataTableToJson());
                    var action = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[8].DataTableToJson());
                    return this.Ok(
                        new
                        {
                            Types = type,
                            SubTypes = focus,
                            Keywords = keyword,
                            InvestorThemes = investorthemes,
                            ThematicTags = thematictag,                            
                            Industries = industries,
                            Analysts = analysts,
                            Tickers = tickers,
                            ActionTags = action

                        }
                    );
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spPickList message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        /// <summary>
        ///  Delete Model
        /// </summary>
        /// <param name="model"></param>
        /// <returns></returns>
        [HttpPost]
        public HttpResponseMessage deleteModel(ModelVM model)
        {

            string ip = Request.GetClientIpAddress();
            //((string[])(Request.Headers.GetValues("params1")))[0]
            try
            {
                logger.Info("deleteModel request by {0} for ModelId:{1}", model.userId, model.modelId);
                string company = string.Empty;


                int status = new int();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[2];
                    sqlParams[0] = new SqlParameter("@ModelId", model.modelId);
                    sqlParams[1] = new SqlParameter("@EditorId", model.userId);

                    //status = dh.ExecuteNonQuery("spDeleteModel", CommandType.StoredProcedure, sqlParams);
                }

                //clsDataLayer db = new clsDataLayer();
                //var res = db.Execute("sp_SearchData 0,0,'" + text + "','" + company + "'");
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(status.ToString());
                logger.Info("deleteModel request end by {0}", ip);
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at deleteModel message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }



        public HttpResponseMessage getRenderTickers()
        {
            DataTable dtSearchResult = new DataTable();
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                dtSearchResult = dh.ExecuteDataTable("spRenderAllSecuritiesT", CommandType.StoredProcedure, null);
            }

            var response = new HttpResponseMessage(HttpStatusCode.OK);
            //var str = JsonConvert.SerializeObject(res);http
            response.Content = new StringContent(dtSearchResult.DataTableToJson());
            return response;
        }

        /// <summary>
        /// Get Tooltip for financials based on params
        /// </summary>
        /// <param name="Ticker"></param>
        /// <param name="FinancialNumberType"></param>
        /// <param name="Year"></param>
        /// <param name="Eq1"></param>
        /// <param name="Eq2"></param>
        /// <returns></returns>
        [HttpGet]
        public HttpResponseMessage getToolTip(string ticker = "")
        {
            try
            {
                string ip = Request.GetClientIpAddress();

                DataTable dtSearchResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    logger.Info("getModelToolTip request by {0} for ModelId:{1}", ip, ticker);
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@ModelId", ticker);

                    dtSearchResult = dh.ExecuteDataTable("spGetModelChangeToolTip", CommandType.StoredProcedure, sqlParams);

                }
                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(dtSearchResult.DataTableToJson());
                logger.Info("getToolTip request end by {0}", ip);
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getToolTip message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }
        }

        /// <summary>
        /// Get PubId's from Endeca based on text passed.
        /// </summary>
        /// <param name="text"></param>
        /// <returns></returns>
        //public HttpResponseMessage getPubidByText(string text)
        //{
        //    string ip = Request.GetClientIpAddress();

        //    try
        //    {
        //        logger.Info("Start request by {0}", ip);

        //        string EndecaHostName = System.Configuration.ConfigurationManager.AppSettings["Endeca.HostName"];
        //        string SearchKey = System.Configuration.ConfigurationManager.AppSettings["Endeca.SearchKey"];
        //        int EndecaPort = 21000;
        //        int size = 50000;
        //        int.TryParse(System.Configuration.ConfigurationManager.AppSettings["Endeca.Port"], out EndecaPort);
        //        int.TryParse(System.Configuration.ConfigurationManager.AppSettings["Endeca.RecordSize"], out size);
        //        logger.Info("Endeca.HostName {0}", EndecaHostName);
        //        logger.Info("Endeca.SearchKey {0}", SearchKey);
        //        logger.Info("Endeca.Port {0}", EndecaPort);
        //        logger.Info("Endeca.RecordSize {0}", size);
        //        Endeca.Navigation.ENEQuery query = new Endeca.Navigation.ENEQuery();
        //        ////query.NavRecordFilter = null;
        //        ////query.NavAllRefinements = true;
        //        //////query.NavERecsPerAggrERec = int.MaxValue; //all records
        //        ////query.NavERecSearchComputeAlternativePhrasings = true;
        //        ////query.NavERecSearchDidYouMean = false;
        //        ////query.NavDescriptors = new Endeca.Navigation.DimValIdList();
        //        ////query.NavDescriptors.AddDimValueId(0);
        //        //query.NavRecordFilter = null;
        //        //query.NavAllRefinements = true;
        //        //query.NavERecsPerAggrERec = 2; //all records
        //        //query.NavERecSearchComputeAlternativePhrasings = true;
        //        //query.NavERecSearchDidYouMean = true;
        //        //query.NavDescriptors = new DimValIdList();
        //        //query.NavDescriptors.AddDimValueId(0);


        //        //Endeca.Navigation.ENEQuery query = new Endeca.Navigation.ENEQuery();
        //        query.NavAllRefinements = true;
        //        query.NavERecSearchComputeAlternativePhrasings = true;
        //        query.NavERecSearchDidYouMean = false;

        //        query.NavDescriptors = new Endeca.Navigation.DimValIdList();
        //        query.NavDescriptors.AddDimValueId(0);
        //        //Endeca.Navigation.HttpENEConnection connection = new Endeca.Navigation.HttpENEConnection(EndecaHostName, EndecaPort);
        //        //query.NavNumERecs = size;               

        //        Endeca.Navigation.HttpENEConnection connection = new Endeca.Navigation.HttpENEConnection(EndecaHostName, EndecaPort);
        //        //FieldList field = new FieldList();
        //        //field.Add("");
        //        //Endeca.Navigation.ERecSearch eRecSearch = new Endeca.Navigation.ERecSearch("p.content", "\"\"" + text + "\"\"", "mode matchany");//, "mode matchany"
        //        ERecSearchList searches = new ERecSearchList();
        //        string and = " and ", or = " or ";
        //        if (text.Contains(and) || text.Contains(or))
        //        {
        //            var splitText = text.Split(new string[] { and }, 100, StringSplitOptions.RemoveEmptyEntries);
        //            foreach (var sText in splitText)
        //            {
        //                if (sText.Contains(or))
        //                {
        //                    searches.Add(0, new Endeca.Navigation.ERecSearch("p.content", sText.Replace(or, " "), "mode matchany"));

        //                }
        //                else
        //                    searches.Add(0, new Endeca.Navigation.ERecSearch("p.content", "\"" + sText + "\"", "mode matchall"));
        //            }

        //        }
        //        else
        //        {
        //            searches.Add(0, new Endeca.Navigation.ERecSearch("p.content", "\"" + text + "\"", "mode matchall"));
        //        }




        //        //searches.Add(0, new Endeca.Navigation.ERecSearch("p.content", "\"\"" + "drilling" + "\"\"", "mode matchany"));
        //        //searches.Add(0, new Endeca.Navigation.ERecSearch("p.content", "\"\"" + "bob" + "\"\"", "mode matchany"));
        //        query.NavNumERecs = size;
        //        query.NavERecSearches = searches;

        //        query.AddSelection("p.pdf-path");
        //        //query.AddSelection("p.content");
        //        ENEQueryResults results = connection.Query(query);

        //        //if (results.Navigation.ERecsContainsERecs())
        //        //{
        //        List<string> pids = new List<string>();
        //        string result = string.Empty;
        //        logger.Info("Endeca.ResultCount {0}", results.Navigation.ERecs.Count);
        //        foreach (ERec rec in results.Navigation.ERecs)
        //        {
        //            if (!string.IsNullOrWhiteSpace(rec.Spec))
        //            {
        //                var arr = rec.Spec.Split('\\');
        //                var pid = 0;
        //                if (arr.Count() > 0)
        //                {
        //                    int.TryParse(arr[arr.Count() - 1].ToString().Replace(".pdf", ""), out pid);
        //                }
        //                else
        //                {
        //                    int.TryParse(rec.Spec, out pid);
        //                }

        //                if (pid != 0)
        //                {
        //                    pids.Add(pid.ToString());
        //                }
        //            }
        //            // result += "author:" + rec.Properties.GetValues("p.pdf-path")[0]; //+ string.Join(",", rec.Properties.GetValues("p.pdf-path").ToArray());
        //        }


        //        result = string.Join(",", pids);
        //        if (string.IsNullOrEmpty(result))
        //        {
        //            var response = new HttpResponseMessage(HttpStatusCode.OK);
        //            response.Content = new StringContent("0");
        //            return response;
        //        }
        //        else
        //        {
        //            var response = new HttpResponseMessage(HttpStatusCode.OK);
        //            response.Content = new StringContent(result);
        //            return response;
        //        }

        //    }
        //    catch (Exception ex)
        //    {
        //        logger.Error("Exception at getPubidByText message:{0}", ex.Message);
        //        var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
        //        response.Content = new StringContent(ex.Message);
        //        return response;
        //    }
        //}

        //[HttpPost]
        //public async Task<IHttpActionResult> CreateSearchPortfolioIndex()
        //{
        //    if (!esClient.IndexExists("search-portfolio").Exists)
        //    {
        //        var indexResponse = esClient.CreateIndex("search-portfolio", c => c
        //                                                  .Mappings(m => m
        //                                                    .Map<BeehiveQuery>(mp => mp
        //                                                        .AutoMap())));

        //        return Ok(indexResponse.Acknowledged);
        //    }

        //    //index already exists
        //    return Ok(false);

        //}

              
        [Route("api/beehive/getSearchResults")]
        [HttpGet]
        public async Task<IHttpActionResult> getSearchResults(string propValue, string propName)
        {
            int size = 1000;
            int.TryParse(SearchSize, out size);

            string propertyName = propName.ToLower();
            Nest.ISearchResponse<Research> searchResults = null;

            PropertyValueList property = new PropertyValueList()
            {
                propName = propertyName,
                propValue = new List<string>() { propValue }
            };

            List<PropertyValueList> propertyDictionary = new List<PropertyValueList>() { property };

            List<Research> results = ElasticData.SearchResearch(propertyDictionary);
            if (results.Count > 0)
            {
                //string pubNos = string.Join(",", results.Select(x => x.Id.ToString()).ToList());
                //List<Research> research = getResearchFromDB(null, size);
                //return Ok(research);
                List<SearchResultsScore> searchResultsScores = new List<SearchResultsScore>();
                foreach (Research hit in results)
                {
                    SearchResultsScore pubScore = new SearchResultsScore()
                    {
                        pubId = hit.pubId,
                        score = hit.score
                    };

                    searchResultsScores.Add(pubScore);
                }
                //string pubNos = string.Join(",", results.Select(x => x.Id.ToString()).ToList());
                List<Research> research = getResearchFromDB(searchResultsScores, size);
                return Ok(research);
            }
            else
            {
                return Ok(new List<Research>());
            }
        }



        [HttpPost]
        public async Task<IHttpActionResult> saveSavedSearch([FromBody]BeehiveQuery savedQuery)
        {
                return Ok(ElasticData.SaveSearchQuery(savedQuery));

        }

        [Route("api/beehive/getSavedSearch")]
        [HttpGet]
        public IHttpActionResult getSavedSearch(string userId=null)
        {
            List<BeehiveQuery> queries = ElasticData.GetSavedSearchesByUser(userId);
            return Ok(queries);
        }
        //[Route("api/beehive/getSavedSearch")]
        //[HttpGet]
        //public IHttpActionResult getSavedSearch()
        //{
        //    List<BeehiveQuery> queries = ElasticData.GetSavedSearchesByUser();
        //    return Ok(queries);
        //}

        [HttpPost]
        public async Task<IHttpActionResult> updateSavedSearch(BeehiveQuery savedQuery)
        {
            return Ok(ElasticData.UpdateSearchQuery(savedQuery));

        }

        [HttpPost]
        public async Task<IHttpActionResult> deleteSavedSearch(BeehiveQuery savedQuery)
        {
            return Ok(ElasticData.deleteSearchQuery(savedQuery));

        }




        public List<Research> GetRecentReports(int pageSize, string pubId,int? UserId=null)
        {
            try
            {
                    
                int size = 1000;
                int.TryParse(SearchSize, out size);
                List<SearchResultsScore> pubNos = new List<SearchResultsScore>();
                if (pubId != null)
                {
                    SearchResultsScore pubNo = new SearchResultsScore()
                    {
                        pubId = Int32.Parse(pubId),
                        score = 0
                    };

                    pubNos.Add(pubNo);
                }
                return getResearchFromDB(pubNos, size,UserId);
            }
            catch (Exception ex)
            {
                logger.Info("After GetRecentReports method " + ex.Message);
                throw;
            }
        }

        /// <summary>
        /// Get Research, to get research screen data.
        /// </summary>
        /// <param name="propertyDictionary"></param>
        /// <param name="style"></param>
        /// <param name="userId"></param>
        /// <returns></returns>
        [Route("api/beehive/getResearch")]
        [HttpPost]
        public IHttpActionResult getResearch([FromBody]List<PropertyValueList> propertyDictionary, [FromUri] int style = 1,int? userId=null)
        {

            int size = 1000;
            int.TryParse(SearchSize, out size);

            if (style == 1)
            {
                if (propertyDictionary?.Count == 0)
                {
                    List<Research> results1 = GetRecentReports(size, null);
                    ResultCount ret = new ResultCount();
                    ret.HitCount = results1.Count;
                    ret.MaxCount = Convert.ToInt32(SearchSize);
                    return Ok(ret);
                    //List<Research> results1 = GetRecentReports(size, null);
                    //return Ok(results1.Count);
                }
                else if (propertyDictionary.Count == 1 && propertyDictionary[0].propName.ToLower() == "pubno")
                {
                    List<Research> results2 = GetRecentReports(1, propertyDictionary[0].propValue[0]);
                    //return Ok(results2.Count);
                    ResultCount ret = new ResultCount();
                    ret.HitCount = results2.Count;
                    ret.MaxCount = Convert.ToInt32(SearchSize);
                    return Ok(ret);
                }
            }
            else
            {
                if (propertyDictionary.Count == 0)
                    return Ok(GetRecentReports(size, null,userId));
                else if (propertyDictionary.Count == 1 && propertyDictionary[0].propName.ToLower() == "pubno")
                    return Ok(GetRecentReports(1, propertyDictionary[0].propValue[0],userId));
            }
            //Call spGetMetaDataIdForSearchString for text search
            bool isElasticTextSearchEnabled = ConfigurationManager.AppSettings["Elastic.TextSearch.Enabled"]?.ToString().Trim().ToLower() == "true" ? true : false;
            if (propertyDictionary.Count==1 && propertyDictionary.Exists(x => x.propName == "text") && isElasticTextSearchEnabled)
            {
                var outProperty = getResearchTextSearchValue(propertyDictionary[0].propValue[0]);
                if(outProperty.Item2!=null || outProperty.Item2!="")
                {
                    List<string> propValueList = new List<string>();
                    propValueList.Add(outProperty.Item2);
                    propertyDictionary.Add(new PropertyValueList { propName = outProperty.Item1, propValue = propValueList });
                    propertyDictionary.RemoveAll(x => x.propName == "text");
                }

            }
            var ElasticDataVal = ElasticData.SearchResearch(propertyDictionary, style);
            List <Research> results = ElasticDataVal.Item1;
            var totalcount = ElasticDataVal.Item2;

            if (style == 1)
            {
                ResultCount ret = new ResultCount();
                ret.HitCount = Convert.ToInt32(totalcount);
                ret.MaxCount = Convert.ToInt32(SearchSize);
                return Ok(ret);
            }
            else if (style == 2)
            {
                List<SearchResultsScore> searchResultsScores = new List<SearchResultsScore>();
                foreach (Research hit in results)
                {
                    SearchResultsScore pubScore = new SearchResultsScore()
                    {
                        pubId = hit.pubId,
                        score = hit.score
                    };

                    searchResultsScores.Add(pubScore);
                }
                return Ok(searchResultsScores);
            }
            else if (style == 4)
            {
                List<SearchResultsScore> searchResultsScores = new List<SearchResultsScore>();
                foreach (Research hit in results)
                {
                    SearchResultsScore pubScore = new SearchResultsScore()
                    {
                        pubId = hit.pubId,
                        score = hit.score
                    };

                    searchResultsScores.Add(pubScore);
                }
                //string pubNos = string.Join(",", results.Select(x => x.Id.ToString()).ToList());
                if (searchResultsScores.Count > 0)
                {
                    List<Research> research = getResearchFromDB(searchResultsScores, size, userId);
                    return Ok(research);
                }
                else
                    return Ok(results);
            }
            else if (style == 3)
            {
                return Ok(results);

            }
            else
            {
                return Ok(new List<Research>());
            }

        }      

        [Route("api/beehive/getSearchResults")]
        [HttpPost]
        public IHttpActionResult getSearchResults(List<PropertyValueList> propertyDictionary)
        {

            int size = 1000;
            int.TryParse(SearchSize, out size);

            if (propertyDictionary.Count == 0)
                return Ok(GetRecentReports(size, null));
            else if (propertyDictionary.Count == 1 && propertyDictionary[0].propName.ToLower() == "pubno")
                return Ok(GetRecentReports(1, propertyDictionary[0].propValue[0]));


            List<Research> results = ElasticData.SearchResearch(propertyDictionary);
            if (results.Count > 0)
            {
                List<SearchResultsScore> searchResultsScores = new List<SearchResultsScore>();
                foreach (Research hit in results)
                {
                    SearchResultsScore pubScore = new SearchResultsScore()
                    {
                        pubId = hit.pubId,
                        score = hit.score
                    };

                    searchResultsScores.Add(pubScore);
                }
                //string pubNos = string.Join(",", results.Select(x => x.Id.ToString()).ToList());
                List<Research> research = getResearchFromDB(searchResultsScores, size);
                return Ok(research);
            }
            else
            {
                return Ok(new List<Research>());
            }

        }

        /// <summary>Get metadata for research publications from database
        /// PubNos parameter accepts a list comma delimited string of PubNos, a single PubNo, or null value</summary>
        public List<Research> getResearchFromDB(List<SearchResultsScore> pubNos, int size, int? UserId=null)
        {
            try
            {
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    string Content = null;
                    if (pubNos != null && pubNos.Count > 0)
                    {
                        Content = JsonConvert.SerializeObject(pubNos);
                    }
                    //logger.Info("Inside Data Helper");
                    SqlParameter[] sqlParams = new SqlParameter[3];
                    sqlParams[0] = new SqlParameter("@PubNoJSON", Content);
                    sqlParams[1] = new SqlParameter("@Size", size);
                    sqlParams[2] = new SqlParameter("@UserId", UserId);
                    string results = dh.ExecuteJsonReader("spGetSearchResults", CommandType.StoredProcedure, sqlParams);
                    List<Research> response = JsonConvert.DeserializeObject<List<Research>>(results);
                    return response;

                }
            }
            catch (Exception ex)
            {
                DBLogger.Error("controllerName", "actionName", "methodType", "appName",
                                  "message", "payload", "url", "userName");
                logger.Error("Exception at spGetSearchResults message:{0}", ex.Message);
                return null;
            }


        }

        private List<Author> BuildAuthorList(DataRow dr)
        {

            List<Author> authors = new List<Author>();
            string idStr = CommonFunc.DBCellToString(dr["AuthorId_List"]);

            if (string.IsNullOrEmpty(idStr))
            {
                return null;
            }

            List<string> authorIds = idStr.Split('|').ToList();
            List<string> authorNames = CommonFunc.DBCellToString(dr["Author_List"]).Split('|').ToList();
            List<string> authorLastNames = CommonFunc.DBCellToString(dr["LastName_List"]).Split('|').ToList();
            List<string> isActiveList = CommonFunc.DBCellToString(dr["IsActive_List"]).Split('|').ToList();
            List<string> isAnalystList = CommonFunc.DBCellToString(dr["IsAnalyst_List"]).Split('|').ToList();
            for (int i = 0; i < authorIds.Count; i++)
            {
                authors.Add(new Author()
                {
                    id = Convert.ToInt32(authorIds[i]),
                    name = authorNames[i],
                    last = authorLastNames[i],
                    isActive = isActiveList[i] == "-1",
                    isAnalyst = isAnalystList[i] == "-1"
                });
            }

            return authors;


        }

        private List<Ticker> BuildTickerList(DataRow dr)
        {
            List<Ticker> tickers = new List<Ticker>();

            string idStr = CommonFunc.DBCellToString(dr["TickerId_List"]);

            if (string.IsNullOrEmpty(idStr))
            {
                return null;
            }

            List<string> tickerList = CommonFunc.DBCellToString(dr["Ticker_List"]).Split('|').ToList();
            List<string> coverageActionList = CommonFunc.DBCellToString(dr["CoverageAction_List"]).Split('|').ToList();
            List<string> ratingActionList = CommonFunc.DBCellToString(dr["RatingAction_List"]).Split('|').ToList();
            List<string> targetPriceActionList = CommonFunc.DBCellToString(dr["TargetPriceAction_List"]).Split('|').ToList();
            List<string> estimateActionList = CommonFunc.DBCellToString(dr["EstimateAction_List"]).Split('|').ToList();
            List<string> tickerIds = idStr.Split('|').ToList();


            for (int i = 0; i < tickerIds.Count; i++)
            {
                tickers.Add(new Ticker()
                {
                    id = Convert.ToInt32(tickerIds[i]),
                    name = tickerList[i],
                    coverageAction = coverageActionList.Count > i ? coverageActionList[i] : null,
                    ratingAction = ratingActionList.Count > i ? ratingActionList[i] : null,
                    targetPriceAction = ratingActionList.Count > i ? targetPriceActionList[i] : null,
                    estimateAction = estimateActionList.Count > i ? estimateActionList[i] : null,
                });
            }

            return tickers;

        }

        private List<Industry> BuildIndustryList(DataRow dr)
        {
            List<Industry> industries = new List<Industry>();

            string idStr = CommonFunc.DBCellToString(dr["IndustryId_List"]);

            if (string.IsNullOrEmpty(idStr))
            {
                return null;
            }


            List<string> industryList = idStr.Split('|').ToList();
            List<string> industryNames = CommonFunc.DBCellToString(dr["Industry_List"]).Split('|').ToList();


            for (int i = 0; i < industryList.Count; i++)
            {
                industries.Add(new Industry()
                {
                    id = Convert.ToInt32(industryList[i]),
                    name = industryNames[i]
                });
            }
            return industries;



        }

        private List<InvestorTheme> BuildInvestorThemeList(DataRow dr)
        {
            List<InvestorTheme> investorThemes = new List<InvestorTheme>();

            string idStr = CommonFunc.DBCellToString(dr["InvestorThemeId_List"]);

            if (string.IsNullOrEmpty(idStr))
            {
                return null;
            }


            List<string> investorThemeList = idStr.Split('|').ToList();
            List<string> investorThemeNames = CommonFunc.DBCellToString(dr["InvestorTheme_List"]).Split('|').ToList();


            for (int i = 0; i < investorThemeList.Count; i++)
            {
                investorThemes.Add(new InvestorTheme()
                {
                    id = Convert.ToInt32(investorThemeList[i]),
                    name = investorThemeNames[i]
                });
            }
            return investorThemes;



        }

        private List<Keyword> BuildKeywordList(DataRow dr)
        {
            List<Keyword> keywords = new List<Keyword>();

            string idStr = CommonFunc.DBCellToString(dr["KeywordId_List"]);

            if (string.IsNullOrEmpty(idStr))
            {
                return null;
            }


            List<string> keywordList = idStr.Split('|').ToList();
            List<string> keywordNames = CommonFunc.DBCellToString(dr["Keyword_List"]).Split('|').ToList();


            for (int i = 0; i < keywordList.Count; i++)
            {
                keywords.Add(new Keyword()
                {
                    id = Convert.ToInt32(keywordList[i]),
                    name = keywordNames[i]
                });
            }
            return keywords;



        }



        public HttpResponseMessage getPubidBySearchText(string text)
        {


            string ip = Request.GetClientIpAddress();

            try
            {
                string result = ElasticData.getPubidBySearchText(text);


                if (string.IsNullOrEmpty(result))
                {
                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent("0");
                    return response;
                }
                else
                {
                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(result);
                    return response;
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getPubidByText message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent(ex.Message);
                return response;
            }
        }


        #region Price Chart

        /// <summary>
        /// Get Chart tiker close price and target price within data range.
        /// </summary>
        /// <param name="duration"></param>
        /// <param name="Securityid"></param>
        /// <returns>JSON data as a response</returns>
        ///  public HttpResponseMessage getChartData(string duration, int Securityid)
        public HttpResponseMessage getChartData([FromUri] ToolsPayLoad objPayLoad)
        {

            try
            {

                System.Configuration.Configuration oConfig = Bernstein.IRS.Utility.ScbSettings.GetConfigObject();
                string C3DataPoint = oConfig.AppSettings.Settings["C3.Chart.Datapoint"].Value.ToString();

                int securityid = objPayLoad.SecurityId;
                string duration = objPayLoad.duration;
                string Ticker = objPayLoad.Ticker;
                DataSet ds = new DataSet();
                DataTable durationTable = new DataTable("Duration");

                DataColumn durationName = durationTable.Columns.Add("DurationID", typeof(string));
                durationName.AllowDBNull = false;
                durationName.Unique = true;

                durationTable.Columns.Add("DurationDate", typeof(DateTime));

                DataRow durationRow = durationTable.NewRow();
                durationRow[0] = "0d";
                durationRow[1] = DateTime.Now.ToShortDateString();
                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "1d";
                durationRow[1] = DateTime.Now.AddDays(-1).ToShortDateString();
                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "7d";
                durationRow[1] = DateTime.Now.AddDays(-7).ToShortDateString();
                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "1m";
                durationRow[1] = DateTime.Now.AddMonths(-1).ToShortDateString();
                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "3m";
                durationRow[1] = DateTime.Now.AddMonths(-3).ToShortDateString();
                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "6m";
                durationRow[1] = DateTime.Now.AddMonths(-6).ToShortDateString();
                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "1y";
                durationRow[1] = DateTime.Now.AddYears(-1).ToShortDateString();
                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "2y";
                durationRow[1] = DateTime.Now.AddYears(-2).ToShortDateString();

                durationTable.Rows.Add(durationRow);

                durationRow = durationTable.NewRow();
                durationRow[0] = "3y";
                durationRow[1] = DateTime.Now.AddYears(-3).ToShortDateString();
                durationTable.Rows.Add(durationRow);


                DateTime dateForButton = DateTime.Now;
                string sDuration = duration.ToLower();
                if (sDuration == "1d")
                    dateForButton = DateTime.Now.AddDays(-1);
                else if (sDuration == "7d")
                    dateForButton = DateTime.Now.AddDays(-7);
                else if (sDuration == "1m")
                    dateForButton = DateTime.Now.AddMonths(-1);
                else if (sDuration == "3m")
                    dateForButton = DateTime.Now.AddMonths(-3);
                else if (sDuration == "6m")
                    dateForButton = DateTime.Now.AddMonths(-6);
                else if (sDuration == "1y")
                    dateForButton = DateTime.Now.AddYears(-1);
                else if (sDuration == "2y")
                    dateForButton = DateTime.Now.AddYears(-2);
                else if (sDuration == "3y")
                    dateForButton = DateTime.Now.AddYears(-3);


                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[4];
                    sqlParams[0] = new SqlParameter("@SecurityID", CommonFunc.GetDBValue(objPayLoad.SecurityId));
                    sqlParams[1] = new SqlParameter("@StartDate", CommonFunc.GetDBValue(dateForButton));
                    sqlParams[2] = new SqlParameter("@EndDate", CommonFunc.GetDBValue(DateTime.Now));
                    sqlParams[3] = new SqlParameter("@datapoint", CommonFunc.GetDBValue(C3DataPoint));

                    ds = dh.ExecuteDataSet("spGetChartData2", CommandType.StoredProcedure, sqlParams);
                }

                // string closePrices = string.Empty, targetPrices = string.Empty;
                DataTable closePrices = ds.Tables[0];
                DataTable targetPrices = ds.Tables[1];
                string prvstrChartDate = string.Empty, nextstrChartDate = string.Empty;
                double lastTarget = 0.0;

                closePrices.Columns.Add("TargetPrice", typeof(System.Double));



                foreach (DataRow Targetrow in targetPrices.Rows)
                {
                    if (Targetrow["Date"].ToString() != "")
                    {
                        double myNum;
                        Boolean isNumber = true;

                        if (Double.TryParse(Targetrow["TargetPrice"].ToString(), out myNum))
                        {
                            lastTarget = Convert.ToDouble(Targetrow["TargetPrice"]);
                        }
                        else
                        {
                            isNumber = false;
                        }

                        foreach (DataRow row in closePrices.Rows)
                        {

                            if (Convert.ToDateTime(row["Date"]) >= Convert.ToDateTime(Targetrow["Date"]))
                            {
                                if ((Convert.ToString(Targetrow["RatingActionCode"]) != "DC" && Convert.ToString(Targetrow["RatingActionCode"]) != "SC"))
                                {

                                    row["TargetPrice"] = lastTarget;
                                }
                                else if (isNumber == false)
                                {
                                    row["TargetPrice"] = lastTarget;
                                }
                                else
                                    row["TargetPrice"] = 0;
                            }

                        }
                    }
                }
                DataView view = targetPrices.DefaultView;
                view.RowFilter = "CONVERT(Isnull(date,''), System.String) <> ''";
                targetPrices = view.ToTable();
                foreach (DataRow row in targetPrices.Rows)
                {

                    if (row["RatingActionCode"].ToString() == "")
                        row["Rating"] = row["Rating"].ToString();
                    else
                        row["Rating"] = row["Rating"].ToString() + "(" + row["RatingActionCode"].ToString() + ")";

                }




                return ControllerContext.Request.CreateResponse(HttpStatusCode.OK, new { closePrices, targetPrices });
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getChartData message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Chart data is not avaliable.");
            }

        }

        public HttpResponseMessage getChartsImage(int securityId, string ticker, string type)
        {
            HttpResponseMessage response = null;
            string filepath = string.Empty;
            try
            {

                //var phantomJS = new PhantomJS();

                string folderpath = string.Empty;
                //string ZoomFactor = "1";
                //string width = "800";
                if (securityId > 0)
                {
                    //Impersonation.Impersonate();
                    System.Configuration.Configuration oConfig = ScbSettings.GetConfigObject();
                    //RegistryKey RegKey = Registry.CurrentUser.OpenSubKey(@"Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings", true);
                    //try
                    //{
                    //    RegKey.SetValue("ProxyServer", oConfig.AppSettings.Settings["Proxy.Host"].Value.ToString());
                    //    RegKey.SetValue("ProxyEnable", 1);
                    //    helper.AddTrustedSiteToInternetExplorer(oConfig.AppSettings.Settings["Trusted.Site"].Value.ToString());

                    //}
                    //catch (Exception ex)
                    //{
                    //    logger.Error("Exception at setting proxy:{0}", ex.Message);
                    //    return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ex.Message);
                    //}
                    //Impersonation.Revert();
                    //string uri = oConfig.AppSettings.Settings["Local_Chart_Url"].Value.ToString(); //ConfigurationManager.AppSettings["Local_Chart_Url"];
                    //string 
                    // uri = uri + "savechartimage.html#/"; // "http://localhost:4200/#/";

                    //string imagename = string.Empty;
                    //imagename = Ticker + ".png";
                    //folderpath = "~/tmp/charts/images/" + imagename;
                    //if (type == "pricechart")
                    //{
                    //    ZoomFactor = oConfig.AppSettings.Settings["pricechart"].Value.ToString();
                    //    uri = uri + "charts/pricechart/" + Ticker + "/yes";
                    //    width = oConfig.AppSettings.Settings["pricechart_width"].Value.ToString();
                    //}
                    //else if (type == "pricehistory")
                    //{
                    //    ZoomFactor = oConfig.AppSettings.Settings["pricehistory"].Value.ToString();
                    //    uri = uri + "charts/pricehistory/" + Ticker + "/yes";
                    //    width = oConfig.AppSettings.Settings["pricehistory_width"].Value.ToString();
                    //}
                    //else if (type == "relativereturn")
                    //{
                    //    ZoomFactor = oConfig.AppSettings.Settings["relativereturn"].Value.ToString();
                    //    uri = uri + "charts/relativereturn/" + Ticker + "/yes";
                    //    width = oConfig.AppSettings.Settings["relativereturn_width"].Value.ToString();
                    //}
                    //else if (type == "performance")
                    //{
                    //    ZoomFactor = oConfig.AppSettings.Settings["performance"].Value.ToString();
                    //    uri = uri + "charts/priceperformance/" + Ticker + "/yes";
                    //    width = oConfig.AppSettings.Settings["performance_width"].Value.ToString();
                    //}
                    //try
                    //{
                    //    string rasterizePath = "~/js/" + "rasterize.js";
                    //    //System.Web.Hosting.HostingEnvironment.MapPath("~/PathGoesHere");
                    //    phantomJS.Run(System.Web.Hosting.HostingEnvironment.MapPath(rasterizePath), new[] { uri, System.Web.Hosting.HostingEnvironment.MapPath(folderpath), ZoomFactor, width });
                    //}
                    //finally
                    //{
                    //    phantomJS.Abort(); // ensure that phantomjs.exe is stopped
                    //}
                    Impersonation.Impersonate();
                    filepath = oConfig.AppSettings.Settings["Chart_Save_Path"].Value.ToString() + securityId + ".png";
                    if (filepath != string.Empty)
                    {
                        var fileLength = new FileInfo(filepath).Length;
                        double fileSizeKB = fileLength / 1024;
                        if (fileSizeKB > 3)
                        {
                            if (!File.Exists(filepath))
                                throw new HttpResponseException(HttpStatusCode.NotFound);
                            FileStream fileStream = new FileStream(filepath, FileMode.Open);

                            response = new HttpResponseMessage { Content = new StreamContent(fileStream) };
                            response.Content.Headers.ContentType = new MediaTypeHeaderValue("image/jpg");
                            FileInfo f = new FileInfo(filepath);
                            long s1 = f.Length;
                            response.Content.Headers.ContentLength = s1;
                        }
                        return response;
                    }
                    Impersonation.Revert();
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at download image:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ex.Message);
            }
            finally
            {

            }
            return response;
        }

        //[HttpGet]
        //public HttpResponseMessage executeBatchJob()
        //{
        //    HttpResponseMessage response = null;
        //    try
        //    {
        //        C3PriceChart objChart = new C3PriceChart();
        //        objChart.ExecutePriceChartBatchJob();
        //        response = new HttpResponseMessage(HttpStatusCode.OK);
        //        response.Content = new StringContent("Batch Job completed successfully.");
        //    }
        //    catch (Exception ex)
        //    {
        //        logger.Error("Exception at Batch Job:{0}", ex.Message);
        //        return Request.CreateErrorResponse(HttpStatusCode.BadRequest, ex.Message);
        //    }
        //    return response;
        //}

        #endregion  Price chart

        public HttpResponseMessage getDraftValuebySecurityiD(string SecurityID)
        {

            DataTable dtAnalyst = new DataTable();
            string retTicker = string.Empty;
            try
            {

                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@SecurityId", CommonFunc.GetDBValue(Convert.ToInt32(SecurityID)));

                    DataSet ds = dh.ExecuteDataSet("spGetDraftValueBySecuirtyID", CommandType.StoredProcedure, sqlParams);
                    dtAnalyst = ds.Tables[0];
                }


                if (dtAnalyst != null)
                {
                    retTicker = dtAnalyst.DataTableToJson();

                }


                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(retTicker);
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getTickersAll message:{0}", ex.Message);
                return Request.CreateErrorResponse(HttpStatusCode.BadRequest, "Error Occurred !!!!");
            }

        }




        /// <summary>
        /// Generic method to format respose based on Accept type by sending any sql query as param
        /// </summary>
        /// <param name="sql"></param>
        /// <returns></returns>
        [HttpPost]
        public IHttpActionResult GetResponse(string sql)
        {
            try
            {
                var res = Database.GetDataTable(CommonFunc.ResearchConnectionString(), sql);
                return Ok(res);
            }
            catch (Exception ex)
            {
                return InternalServerError(ex);
            }
        }

        [HttpPost]
        public IHttpActionResult getEligibleChanges(HttpRequestMessage request)
        {
            var doc = new XmlDocument();
            doc.Load(request.Content.ReadAsStreamAsync().Result);

            var res = Database.GetDataTable(CommonFunc.ResearchConnectionString(), "spGetEligibleChanges '" + doc.DocumentElement.OuterXml + "'");
            if (res != null && res.Rows[0] != null)
            {
                //doc = new XmlDocument();
                doc.LoadXml(res.Rows[0][0].ToString());
                return Ok(doc.DocumentElement);
            }
            else
                return BadRequest();
        }

        [HttpGet]
        public HttpResponseMessage getResearchUsage(string sWHERE = "")
        {

            string ip = Request.GetClientIpAddress();
            try
            {
                //logger.Info("getResearchUsage request by {0} for {1} text", ip, text);
                var _connStringSlx = System.Configuration.ConfigurationManager.ConnectionStrings["SalesLogix"];
                string sSQL = string.Empty;

                //System.IO.DirectoryInfo di = new System.IO.DirectoryInfo(Server.MapPath("/sqlxml/datagrid/_webusage.sql"));
                //FileInfo file = di.getfilGetFiles("_webusage.sql");

                using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/datagrid/_webusage.sql"))
                {
                    sSQL = sr.ReadToEnd();
                }
                sSQL = sSQL.Replace("--$WHERE", sWHERE);

                //DataTable dt = Database.GetDataTable(_connStringSlx.ConnectionString.ToString(), sSQL);
                using (DataHelper dh = new DataHelper(_connStringSlx.ConnectionString.ToString()))
                {
                    DataTable dt = dh.ExecuteDataTable(sSQL, CommandType.Text, null);

                    var val = dt.DataTableToJson();

                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(val.ToString());
                    logger.Info("getResearchUsage request end by {0}", ip);
                    return response;
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getResearchUsage message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        [HttpGet]
        public HttpResponseMessage getContentUsage(String sWhere = "")
        {

            string ip = Request.GetClientIpAddress();
            try
            {
                logger.Info("getContentUsage request by {0} for {1} text", ip, sWhere);
                var _connStringSlx = System.Configuration.ConfigurationManager.ConnectionStrings["SalesLogix"];
                string sSQL = string.Empty;
                //string sWHERE = string.Empty;
                //System.IO.DirectoryInfo di = new System.IO.DirectoryInfo(Server.MapPath("/sqlxml/datagrid/_webusage.sql"));
                //FileInfo file = di.getfilGetFiles("_webusage.sql");

                using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/datagrid/_contentusage.sql"))
                {
                    sSQL = sr.ReadToEnd();
                }
                sSQL = sSQL.Replace("--$WHERE", sWhere);

                //DataTable dt = Database.GetDataTable(_connStringSlx.ConnectionString.ToString(), sSQL);
                using (DataHelper dh = new DataHelper(_connStringSlx.ConnectionString.ToString()))
                {
                    DataTable dt = dh.ExecuteDataTable(sSQL, CommandType.Text, null);
                    var val = dt.DataTableToJson();

                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(val.ToString());
                    logger.Info("getContentUsage request end by {0}", ip);
                    return response;
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getContentUsage message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        public HttpResponseMessage getRenderContentUsage()
        {

            string ip = Request.GetClientIpAddress();
            try
            {
                //logger.Info("getSearchData request by {0} for {1} text", ip, text);


                DataSet dtSearchResult = new DataSet();
                string data = string.Empty;

                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[0];

                    dtSearchResult = dh.ExecuteDataSet("spRenderContentUsage", CommandType.StoredProcedure, sqlParams);
                }


                foreach (DataTable dt in dtSearchResult.Tables)
                {
                    if (string.IsNullOrEmpty(data))
                        data += "{data:{linksource:" + dt.DataTableToJson();
                    else
                    {
                        data += "," + "linkstatus:" + dt.DataTableToJson();
                    }
                }
                data += "}}";

                var val = Newtonsoft.Json.JsonConvert.DeserializeObject(data);

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(val.ToString());
                logger.Info("getRenderContentUsage request end by {0}", ip);
                return response;

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getRenderContentUsage message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }
        [Route("api/beehive/getDataFromSource/")]
        [HttpGet]
        public HttpResponseMessage getDataFromSource(String source = "", String sWhere = "")
        {

            string ip = Request.GetClientIpAddress();
            try
            {
                logger.Info("getDataFromSource request by {0} for {1} text", ip, source);

                if (string.IsNullOrEmpty(source))
                {
                    logger.Info("getDataFromSource bad request end by {0}", ip);
                    var response = new HttpResponseMessage(HttpStatusCode.BadRequest);
                    response.Content = new StringContent("Source is Empty");
                    return response;
                }
                else
                {
                    System.Web.HttpContext.Current.Server.ScriptTimeout = 300;

                    var _connString = source.Contains('_') ? System.Configuration.ConfigurationManager.ConnectionStrings["SalesLogix"] :
                     System.Configuration.ConfigurationManager.ConnectionStrings["Research"];
                    string sSQL = string.Empty;
                    //string sWHERE = string.Empty;
                    //System.IO.DirectoryInfo di = new System.IO.DirectoryInfo(Server.MapPath("/sqlxml/datagrid/_webusage.sql"));
                    //FileInfo file = di.getfilGetFiles("_webusage.sql");


                    using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/datagrid/" + source + ".sql"))
                    {
                        sSQL = sr.ReadToEnd();
                    }
                    sSQL = sSQL.Replace("--$WHERE", sWhere);

                    //DataTable dt = Database.GetDataTable(_connString.ConnectionString.ToString(), sSQL);

                    using (DataHelper dh = new DataHelper(_connString.ConnectionString.ToString()))
                    {
                        DataTable dt = dh.ExecuteDataTable(sSQL, CommandType.Text, null);
                        //var columnMetaData = dt.DataTableColumnToJson();
                        DataTable colDt = dt.Clone();

                        foreach (DataColumn col in colDt.Columns)
                        {
                            colDt.Columns[col.ColumnName].DataType = typeof(string);
                        }
                        DataRow dr = colDt.NewRow();
                        foreach (DataColumn col in dt.Columns)
                        {
                            dr[col.ColumnName] = col.DataType.Name;
                        }
                        colDt.Rows.InsertAt(dr, 0);

                        var val = dt.DataTableToJson();
                        var cols = colDt.DataTableToJson();
                        cols = cols.Replace("[", "").Replace("]", "");
                        var response = new HttpResponseMessage(HttpStatusCode.OK);
                        response.Content = new StringContent(val.ToString().Insert(1, cols + ","));
                        logger.Info("getDataFromSource request end by {0}", ip);
                        return response;
                    }

                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getDataFromSource message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        [Route("api/beehive/getDataFromDataSource/")]
        [HttpGet]

        public HttpResponseMessage getDataFromDataSource(String source = "research", String sql = "", String sqltype = "sp", String sWhere = "", bool withType = false)
        {

            string ip = Request.GetClientIpAddress();
            try
            {
                logger.Info("getDataFromDataSource request by {0} for source: {1} ,sql: {2}, sqltype: {3},sWhere: {4},withType: {5}",
                    ip, source, sql, sqltype, sWhere, withType);

                if (string.IsNullOrEmpty(sql))
                {
                    logger.Info("getDataFromDataSource bad request end by {0}", ip);
                    var response = new HttpResponseMessage(HttpStatusCode.BadRequest);
                    response.Content = new StringContent("sql is Empty");
                    return response;
                }
                else
                {
                    System.Web.HttpContext.Current.Server.ScriptTimeout = 300;

                    var _connString = source.ToLower() == "research" ? System.Configuration.ConfigurationManager.ConnectionStrings["Research"] :
                     System.Configuration.ConfigurationManager.ConnectionStrings["SalesLogix"];
                    //string sSQL = string.Empty;
                    //string sWHERE = string.Empty;
                    //System.IO.DirectoryInfo di = new System.IO.DirectoryInfo(Server.MapPath("/sqlxml/datagrid/_webusage.sql"));
                    //FileInfo file = di.getfilGetFiles("_webusage.sql");

                    if (sqltype.ToLower() == "file")
                    {
                        using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/datagrid/" + sql + ".sql"))
                        {
                            sql = sr.ReadToEnd();
                        }
                        sql = sql.Replace("--$WHERE", sWhere);
                    }
                    //DataTable dt = Database.GetDataTable(_connString.ConnectionString.ToString(), sSQL);

                    using (DataHelper dh = new DataHelper(_connString.ConnectionString.ToString()))
                    {
                        DataTable dt = dh.ExecuteDataTable(sql, CommandType.Text, null);
                        //var columnMetaData = dt.DataTableColumnToJson();
                        if (withType)
                        {
                            DataTable colDt = dt.Clone();

                            foreach (DataColumn col in colDt.Columns)
                            {
                                colDt.Columns[col.ColumnName].DataType = typeof(string);
                            }
                            DataRow dr = colDt.NewRow();
                            foreach (DataColumn col in dt.Columns)
                            {
                                dr[col.ColumnName] = col.DataType.Name;
                            }
                            colDt.Rows.InsertAt(dr, 0);

                            var val = dt.DataTableToJson();
                            var cols = colDt.DataTableToJson();
                            cols = cols.Replace("[", "").Replace("]", "");
                            var response = new HttpResponseMessage(HttpStatusCode.OK);
                            response.Content = new StringContent(val.ToString().Insert(1, cols + ","));
                            logger.Info("getDataFromDataSource request with type end by {0}", ip);
                            return response;
                        }
                        else
                        {
                            var val = dt.DataTableToJson();
                            var response = new HttpResponseMessage(HttpStatusCode.OK);
                            response.Content = new StringContent(val.ToString());
                            logger.Info("getDataFromDataSource request end by {0}", ip);
                            return response;

                        }
                    }

                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getDataFromDataSource message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }


        [HttpGet]
        public HttpResponseMessage getFileProcessingLog(string FromDate, string ToDate)
        {

            string ip = Request.GetClientIpAddress();
            try
            {
                logger.Info("getFileProcessingLog request by {0} for {1} From Date - {2} To Date ", ip, FromDate, ToDate);
                var _connString = System.Configuration.ConfigurationManager.ConnectionStrings["Research"];
                string sSQL = string.Empty;

                //DataTable dt = Database.GetDataTable(_connStringSlx.ConnectionString.ToString(), sSQL);
                using (DataHelper dh = new DataHelper(_connString.ConnectionString.ToString()))
                {

                    SqlParameter[] sqlParams = new SqlParameter[2];
                    sqlParams[0] = new SqlParameter("@FromDate", CommonFunc.GetDBValue(FromDate));
                    sqlParams[1] = new SqlParameter("@ToDate", CommonFunc.GetDBValue(ToDate));

                    DataTable dt = dh.ExecuteDataTable("spGetFileProcessingLog", CommandType.StoredProcedure, sqlParams);
                    var val = dt.DataTableToJson();

                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(val.ToString());
                    logger.Info("getFileProcessingLog request end by {0}", ip);
                    return response;
                }

            }
            catch (Exception ex)
            {
                logger.Error("Exception at getFileProcessingLog message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        [HttpGet]
        public HttpResponseMessage getPortalEmbargo()
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                logger.Info("getPortalEmbargo request by {0}", ip);
                var _connString = System.Configuration.ConfigurationManager.ConnectionStrings["Research"];
                string sSQL = string.Empty;

                using (DataHelper dh = new DataHelper(_connString.ConnectionString.ToString()))
                {
                    DataTable dt = dh.ExecuteDataTable("spGetPortalEmbargo", CommandType.StoredProcedure);


                    DataTable colDt = dt.Clone();

                    foreach (DataColumn col in colDt.Columns)
                    {
                        colDt.Columns[col.ColumnName].DataType = typeof(string);
                    }
                    DataRow dr = colDt.NewRow();
                    foreach (DataColumn col in dt.Columns)
                    {
                        dr[col.ColumnName] = col.DataType.Name;
                    }
                    colDt.Rows.InsertAt(dr, 0);

                    var val = dt.DataTableToJson();
                    var cols = colDt.DataTableToJson();
                    cols = cols.Replace("[", "").Replace("]", "");
                    var response = new HttpResponseMessage(HttpStatusCode.OK);
                    response.Content = new StringContent(val.ToString().Insert(1, cols + ","));
                    logger.Info("getPortalEmbargo request with type end by {0}", ip);
                    return response;
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getPortalEmbargo message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        [HttpGet]
        public Boolean IsInRole(string text)
        {
            Boolean bRetVal = false;
            long role = Convert.ToInt64(text);
            try
            {
                string[] sRolesList = Request.Headers.GetCookies().Select(name => name.Cookies).First().FirstOrDefault(name => name.Name == "RolesList").Value.ToString().Split(',');

                //string[] sRolesList = text.Split(',');
                for (int i = 0; i < sRolesList.Length; i++)
                {
                    if (long.Parse(sRolesList[i]) == (long)Role.deAdministrator)
                    {
                        bRetVal = true;
                        break;
                    }
                    else if (long.Parse(sRolesList[i]) == (long)role)
                    {
                        bRetVal = true;
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at IsInRole message:{0}", ex.Message);
            }
            return bRetVal;
        }

        [HttpGet]
        public HttpResponseMessage getHtmlEmail(string type, string id = "",string xml="false")
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                /*
                    o	Angular page
                    •	email?type=research&id=### (pubNo)
                    •	email?type=model&id=###    (securityId)
                    •	email?type=cart&id=###     (userId)
                    •	email?type=summary&id=###  (editionId) + salessummary edition(-16)
                    •	email?type=privateclient   (editionId)
                    •	email?type=topreads&id=### (regionId)

                    o	API - REST api to construct default html body with encrypted links.  Responsive.
                    •	getHtmlEmail(type=###&id=###)
                    •	Layout template - responsive, contain embedded css/styling
                 */

                string EmailContent = "";
                string pubtitle = "";

                if (type == "research")
                {
                    EmailContent = HtmlEmail.GetAnalystBlastHtml(id,xml, out pubtitle);
                }
                else if (type == "analystblast")
                {
                    EmailContent = HtmlEmail.GetNewAnalystBlastHtml(id, xml, type);
                }
                else if (type == "model")
                {
                    EmailContent = HtmlEmail.GetModelHtml(id);
                }
                else if (type == "cart")
                {
                    EmailContent = HtmlEmail.GetCartHtml(id);
                }
                else if (type == "summary")
                {
                    EmailContent = HtmlEmail.GetSummaryHtml(id);
                }
                else if (type == "privateclient")
                {
                    EmailContent = HtmlEmail.GetPrivateClientHtml();
                }
                else if (type == "embedlink")
                {
                    EmailContent = HtmlEmail.GetEmbedLinkHtml(id);
                }
                else if (type == "cartlinks")
                {
                    EmailContent = HtmlEmail.GetCartLinksHtml(id);
                }
                else if (type == "topreads")
                {
                    EmailContent = HtmlEmail.GetTopReadsHtml(id);
                }
                else if (type == "asset")
                {

                    EmailContent = HtmlEmail.GetAssetHtml(id);
                }
                else if (type == "notify")
                {
                    EmailContent = HtmlEmail.GetNotifyPublicationHtml(id);
                }
                else if (type == "notifysales")
                {
                    EmailContent = HtmlEmail.GetNewAnalystBlastHtml(id, xml, type);

                    //EmailContent = HtmlEmail.GetNotifySalesHtml(id);              // old format
                    //EmailContent = HtmlEmail.GetNewNotifySalesHtml(id, xml);
                }
                else if (type == "blastauto")
                {
                    EmailContent = HtmlEmail.GetNewAnalystBlastHtml(id, xml, type);

                    //EmailContent = HtmlEmail.GetBlastAutoHtml(id, out pubtitle);    // old format
                    //EmailContent = HtmlEmail.GetNewAnalystBlastAutoHtml(id, xml);
                }
                else
                {
                    EmailContent = "<html><body><b>Email Html string coming from getHtmlEmail function</b></body></html>";
                }

                ////Return HTTP response
                //if (type == "research")      // when type=research, return 2 values - html, Title
                //{
                //    DataTable dt = new DataTable();
                //    dt.Clear();
                //    dt.Columns.Add("EmailContent");
                //    dt.Columns.Add("Title");
                //    DataRow _row1 = dt.NewRow();
                //    _row1["EmailContent"] = EmailContent;
                //    _row1["Title"] = pubtitle;
                //    dt.Rows.Add(_row1);

                //    var val = dt.DataTableToJson();

                //    var response = new HttpResponseMessage(HttpStatusCode.OK);
                //    response.Content = new StringContent(val.ToString());
                //    return response;
                //}
                //// else, return 1 value - html
                //else
                //{
                //    var response = new HttpResponseMessage(HttpStatusCode.OK);
                //    response.Content = new StringContent(EmailContent);
                //    return response;
                //}

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(EmailContent);
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getHtmlEmail message:{0}; source:{1}", ex.Message, ex.Source);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent(ex.InnerException.ToString());
                return response;
            }
        }

        [HttpGet]
        public HttpResponseMessage LoadDistributionList(string rowNumber, string franchisee, string type)
        {
            string ip = Request.GetClientIpAddress();
            int sPubNo = int.Parse(rowNumber);
            try
            {
                bool bIsInFranchise = false;
                string sFranchiseList = string.Empty;
                string sBeehivePath = WebConfigurationManager.AppSettings["Beehive.Path"];
                sFranchiseList = franchisee;//"521,136";
                Impersonation.Impersonate();
                XPathDocument doc = new XPathDocument(sBeehivePath + "files/resources/blastlists.xml"); //(@"C:\BlastLists\files\resources\blastlists.xml");
                XPathNavigator nav = doc.CreateNavigator();
                string[] sFranchises = sFranchiseList.Split(',');
                DataTable dtAuthors = new DataTable();
                List<string> sBlastLists = new List<string> { };
                if (type == "research")
                {
                    sBlastLists = new List<string> { };
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[1];
                        sqlParams[0] = new SqlParameter("@PubNo", sPubNo);
                        dtAuthors = dh.ExecuteDataTable("spGetPublicationAuthors", CommandType.StoredProcedure, sqlParams);
                    }
                    try
                    {
                        foreach (string sFranchise in sFranchises)
                        {
                            for (int i = 0; i < dtAuthors.Rows.Count; i++)
                            {
                                if (sFranchise == dtAuthors.Rows[i]["AuthorId"].ToString())
                                {
                                    bIsInFranchise = true;
                                }
                            }
                        }
                    }
                    catch (Exception ex)
                    {
                    }
                    if (bIsInFranchise == true)
                    {
                        for (int i = 0; i < dtAuthors.Rows.Count; i++)
                        {
                            XPathExpression expr3 = nav.Compile("/Root/BlastLists/BlastList[@analyst='" + dtAuthors.Rows[i]["DisplayName"].ToString().Replace("'", "&apos;") + "']");
                            XPathNodeIterator iterator3 = nav.Select(expr3);
                            if (iterator3.Count > 0)
                            {
                                while (iterator3.MoveNext())
                                {
                                    sBlastLists.Add(iterator3.Current.GetAttribute("id", "") + ';' + iterator3.Current.GetAttribute("name", "") + ';' + iterator3.Current.GetAttribute("analyst", ""));
                                }
                            }
                        }
                    }
                }

                else if (type == "model")
                {
                    sBlastLists = new List<string> { };
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[1];
                        sqlParams[0] = new SqlParameter("@SecurityId", rowNumber);
                        dtAuthors = dh.ExecuteDataTable("spGetModelAuthors", CommandType.StoredProcedure, sqlParams);
                    }
                    for (int i = 0; i < dtAuthors.Rows.Count; i++)
                    {
                        XPathExpression expr3 = nav.Compile("/Root/BlastLists/BlastList[@analyst='" + dtAuthors.Rows[i]["Analyst"].ToString().Replace("'", "&apos;") + "']");
                        XPathNodeIterator iterator3 = nav.Select(expr3);
                        if (iterator3.Count > 0)
                        {
                            while (iterator3.MoveNext())
                            {
                                sBlastLists.Add(iterator3.Current.GetAttribute("id", "") + ';' + iterator3.Current.GetAttribute("name", "") + ';' + iterator3.Current.GetAttribute("analyst", ""));
                            }
                        }
                    }
                }

                IEnumerable<string> sDistinctLists = sBlastLists.Distinct();

                foreach (string sList in sDistinctLists)
                {
                    ListItem newlistitem = new ListItem();
                    newlistitem.Value = sList.Substring(0, sList.IndexOf(';'));
                    newlistitem.Text = sList.Substring(sList.IndexOf(';') + 1, sList.LastIndexOf(';') - sList.IndexOf(';'));
                    newlistitem.Attributes.Add("Title", newlistitem.Text + " (" + sList.Substring(sList.LastIndexOf(';') + 1) + ')');
                }
                Impersonation.Revert();
                JavaScriptSerializer jss = new JavaScriptSerializer();
                string distributionList = jss.Serialize(sBlastLists);
                return Request.CreateResponse(HttpStatusCode.OK, new { distributionList });
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getPortalEmbargo message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        [HttpPost]
        public HttpResponseMessage queueEmail([FromBody] EmailVM data)
        {
            try
            {
                string ip = Request.GetClientIpAddress();
                string json = JsonConvert.SerializeObject(data);
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[6];
                    Array.Clear(sqlParams, 0, sqlParams.Length);
                    sqlParams[0] = new SqlParameter("@ItemId", data.itemId);
                    sqlParams[1] = new SqlParameter("@ItemType", data.itemType);
                    sqlParams[2] = new SqlParameter("@ScheduledByUserName", data.userName);
                    sqlParams[3] = new SqlParameter("@DistributionGroups", data.distributionGroups);
                    sqlParams[4] = new SqlParameter("@Body", data.emailBody);
                    sqlParams[5] = new SqlParameter("@Subject", data.subject);
                    int result = dh.ExecuteNonQuery("spEmailQueue", CommandType.StoredProcedure, sqlParams);
                    return Request.CreateResponse(HttpStatusCode.OK, new { result = "Record for Email : " + result + " Queued Succesfully" });
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spEmailQueue message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }
        }

        // [Route("getHtmlEmail2")]
        [HttpPost]
        public HttpResponseMessage getHtmlEmail([FromBody] HtmlEmailVM data)
        {
            try
            {
                string ip = Request.GetClientIpAddress();

                string sType = data.type;
                string sId = data.id;

                string EmailContent = String.Empty;

                if (sType == "research")
                {
                    string[] sPubId = sId.Split(',');
                    string sSQLId = "";

                    foreach (var PubNo in sPubId)
                    {
                        if (sSQLId == "") { sSQLId = PubNo.Trim().ToString(); }
                        else { sSQLId = sSQLId + "," + PubNo.Trim().ToString(); }
                    }
                    sSQLId = "'" + sSQLId + "'";

                    string pubtitle = "";
                    EmailContent = HtmlEmail.GetAnalystBlastHtml(sSQLId,"false", out pubtitle);
                }

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(EmailContent);
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getHtmlEmail message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }
        }
       
        [HttpGet]
        public IHttpActionResult getCart(string userId)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@UserID", userId);
                    DataTable dtCart = dh.ExecuteDataTable("spApiGetCart", CommandType.StoredProcedure, sqlParams);
                    logger.Info("getCart request end by {0}", ip);
                    var cart = Newtonsoft.Json.JsonConvert.DeserializeObject(dtCart.DataTableToJson());
                    return this.Ok(cart);
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiGetCart message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }

        }

        [HttpPost]
        public IHttpActionResult saveCart([FromBody] CartVM data)
        {
            string Content = JsonConvert.SerializeObject(data);
            var result = DBUpdate(Content, data.Selected, data.ContentId);
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

        private string DBUpdate(string content, bool Selected, int Title)
        {
            try
            {
                string ip = Request.GetClientIpAddress();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    Array.Clear(sqlParams, 0, sqlParams.Length);
                    sqlParams[0] = new SqlParameter("@CartJSON", content);
                    int result = dh.ExecuteNonQuery("spApiSaveCart", CommandType.StoredProcedure, sqlParams);
                    logger.Info("saveIndustry request end by {0}", ip);
                    if (Selected)
                    {
                        return Title + " Added to Cart!";
                    }
                    else
                    {
                        return Title + " Removed from Cart!";
                    }
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spApiSaveCart message:{0}", ex.Message);
                return "Error while creating or updating cart";
            }
        }

        [HttpGet]
        public HttpResponseMessage deleteCart(string userId)
        {
            try
            {
                string ip = Request.GetClientIpAddress();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    Array.Clear(sqlParams, 0, sqlParams.Length);
                    sqlParams[0] = new SqlParameter("@UserID", userId);
                    int result = 0;
                    result = dh.ExecuteNonQuery("spApiDeleteCart", CommandType.StoredProcedure, sqlParams);
                    return Request.CreateResponse(HttpStatusCode.OK, new { result = "Record Set for UserID : " + userId + " Deleted Succesfully" });
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spDeleteCart message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }
        }

        [Route("api/beehive/service")]
        [Route("api/beehive/setService")]
        [HttpGet]
        public HttpResponseMessage SetService(string serviceName, string action)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                /*   GET setService?serviceName=BERNSTEIN Publishing Service&action=restart 
                 *   GET services?serviceName=BERNSTEIN Publishing Service&action=restart   */

                string sIdentity = System.Security.Principal.WindowsIdentity.GetCurrent().Name.ToString();
                string sMachineName = System.Environment.MachineName;
                string sServiceName = serviceName;
                string sDisplayMessage = "";

                logger.Info("SetService request end by {0}; serviceName: {1}; action: {2}", ip, serviceName, action);

                // Missing service name
                if (sServiceName == "")
                {
                    return Request.CreateResponse
                            (HttpStatusCode.OK,
                             new
                             {
                                 returncode = 0,
                                 source = action,
                                 message = "For service: '" + sServiceName + "': " + "' - no matching service was found",
                                 details = "Check provided service name"
                             }
                             );
                }

                // check valid action types
                if (action != "restart" && action != "start" && action != "stop")
                {
                    return Request.CreateResponse
                            (HttpStatusCode.OK,
                             new
                             {
                                 returncode = 0,
                                 source = action,
                                 message = "action: '" + action + "': " + "' - not supported",
                                 details = "Check provided action text"
                             }
                             );
                }

                // map the service to the ServiceController
                ServiceController serviceController = new ServiceController();
                serviceController.ServiceName = sServiceName;
                //serviceController.DisplayName = sServiceName;
                serviceController.MachineName = sMachineName;

                sDisplayMessage = "<br>Machine Name: '" + sMachineName + "'";
                sDisplayMessage = sDisplayMessage + "<br>Service Name: '" + sServiceName + "'";
                sDisplayMessage = sDisplayMessage + "<br>Client IP address: " + ip;

                // check if service exists
                if (ServiceController.GetServices()
                    .Any(ServiceController => ServiceController.ServiceName.Equals(sServiceName)) == true)
                {
                    sDisplayMessage = sDisplayMessage + "<br>Confirm Service exists on the server : YES";
                }
                else
                {
                    sDisplayMessage = sDisplayMessage + "<br>Confirm Service exists on the server : NO";
                    return Request.CreateResponse(HttpStatusCode.OK,
                                                  new { result = sDisplayMessage });
                }

                string svcStatus = serviceController.Status.ToString();

                //Stop service
                if (action == "restart" || action == "stop")
                {
                    if ((serviceController.Status.Equals(ServiceControllerStatus.Running)) ||
                    (serviceController.Status.Equals(ServiceControllerStatus.StartPending)))
                    {
                        sDisplayMessage = sDisplayMessage + "<br>Attempting to stop service ....";
                        serviceController.Stop();
                        System.Threading.Thread.Sleep(3000);
                        serviceController.Refresh();

                        string svcStatusWas = "";
                        while (svcStatus != "Stopped")
                        {
                            svcStatusWas = svcStatus;
                            serviceController.Refresh();
                            // REMEMBER: svcStatus was SET TO serviceController.Status value 
                            // Use the Refresh() Method to refresh the value of myService.Status and reassign it to svcStatus
                            svcStatus = serviceController.Status.ToString();
                        }
                        sDisplayMessage = sDisplayMessage + " Service stopped successfully!!";
                    }
                }

                //Start service
                if (action == "restart" || action == "start")
                {
                    serviceController.WaitForStatus(ServiceControllerStatus.Stopped);
                    sDisplayMessage = sDisplayMessage + "<br> Attempting to start service ....";
                    serviceController.Start();
                    sDisplayMessage = sDisplayMessage + " Service started successfully!!";
                    System.Threading.Thread.Sleep(3000);
                    //serviceController.WaitForStatus(ServiceControllerStatus.Running);
                    serviceController.Refresh();
                }

                return Request.CreateResponse
                        (HttpStatusCode.OK,
                            new
                            {
                                returncode = 0,
                                source = action,
                                message = "'; action: '" + action + "'; Service: '" + sServiceName + "' " + action + " completed successfully",
                                details = sDisplayMessage
                            }
                        );
            }
            catch (Exception ex)
            {
                logger.Error("Exception at serviceName message:{0}; source:{1}", ex.Message, ex.Source);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }
        }

        [Route("api/beehive/services")]
        [Route("api/beehive/getServices")]
        [HttpGet]
        public HttpResponseMessage GetServices()
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                /*   GET getServices
                 *   GET services  */

                string sIdentity = System.Security.Principal.WindowsIdentity.GetCurrent().Name.ToString();
                string sMachineName = System.Environment.MachineName;

                DataTable dtServices = new DataTable();
                dtServices.Columns.Add("ServiceName", typeof(System.String));
                dtServices.Columns.Add("DisplayName", typeof(System.String));
                dtServices.Columns.Add("Status", typeof(System.String));
                dtServices.Columns.Add("ServiceType", typeof(System.String));
                dtServices.Columns.Add("StartupType", typeof(System.String));  // only supported in .NET 4.6.x (ServiceController)

                ServiceController[] services = ServiceController.GetServices();

                /* BERNSTEIN windows services to monitor:
                 * Service Name: "BERNSTEIN Publishing Service"
                 * Service Name: "BERNSTEIN Analyst Blast Service"
                 * Service Name: "BERNSTEIN Distribution Service"
                 * Service Name: "BERNSTEIN Elastic Index Service"
                 * Service Name: "BERNSTEIN File Watcher Service"
                 * Service Name: "BERNSTEIN IUO Relay Service"
                 * Service Name: "BERNSTEIN Job Service"
                 * Service Name: "bepldr8Service"
                 */

                foreach (ServiceController service in services)
                {
                    if (service.DisplayName.ToString().Contains("BERNSTEIN") == true ||
                        service.DisplayName.ToString().Contains("BCL") == true)
                    {
                        DataRow row = dtServices.NewRow();

                        row["ServiceName"] = service.ServiceName;
                        row["DisplayName"] = service.DisplayName;
                        row["Status"] = service.Status;
                        row["ServiceType"] = service.ServiceType;
                        row["StartupType"] = "";

                        dtServices.Rows.Add(row);
                    }
                }

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(dtServices.DataTableToJson());
                logger.Info("GetServices request end by {0}", ip);
                return response;
            }
            catch (Exception ex)
            {
                logger.Error("Exception at GetServices message:{0}; source:{1}", ex.Message, ex.Source);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }
        }

        [HttpGet]
        public HttpResponseMessage impersonate(string fileNames, string userID)
        {
            try
            {
                if (fileNames != null)
                {
                    Impersonation.Impersonate();
                    Configuration oConfig = ScbSettings.GetConfigObject();
                    foreach (String fileName in fileNames.Split('-'))
                    {
                        string sourceFile = oConfig.AppSettings.Settings["Cart_Save_Path"].Value.ToString() + @"\Pubs\" + fileName;
                        string destFile = oConfig.AppSettings.Settings["Cart_Save_Path"].Value.ToString() + @"\Tmp\Cart\" + userID + '_' + fileName;
                        System.IO.File.Copy(sourceFile, destFile, true);
                    }
                    Impersonation.Revert();
                    using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                    {
                        SqlParameter[] sqlParams = new SqlParameter[1];
                        sqlParams[0] = new SqlParameter("@UserID", userID);
                        DataTable dtCart = dh.ExecuteDataTable("spApiGetUser", CommandType.StoredProcedure, sqlParams);
                        GenerateWaterMarkedAttachments(fileNames, userID, dtCart.Rows[0].ItemArray[0].ToString(), dtCart.Rows[0].ItemArray[1].ToString());
                    }
                }
                return Request.CreateResponse(HttpStatusCode.OK, new { result = "Impersonated Succesfully" });
            }
            catch (Exception ex)
            {
                logger.Error("Exception at generating Cart message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }
        }

        private void GenerateWaterMarkedAttachments(string fileNames, string userID, string firstName, string lastName)
        {
            try
            {
                string sConnect = ConfigurationManager.ConnectionStrings["Research"].ToString();
                Configuration oConfig = ScbSettings.GetConfigObject();
                string sBeehiveFilePath = oConfig.AppSettings.Settings["Beehive.File.Path"].Value.ToString();
                string[] sFiles = fileNames.Split('-');
                string sPDFPassword = ConfigurationManager.AppSettings["PDFPassword"].ToString();
                string sWatermarkText = string.Empty;
                sWatermarkText = oConfig.AppSettings.Settings["Beehive.WatermarkText.Attachments"].Value.ToString();
                if (sWatermarkText == "")
                {
                    //sWatermarkText = "For exclusive use of " + Request.Cookies["FirstName"].Value + " " + Request.Cookies["LastName"].Value + " at Sanford C. Bernstein";
                    string sSQL = "spGetWaterMarkByUser " + userID;
                    DataTable dtResultSet = Database.GetDataTable(sConnect, sSQL);
                    if (dtResultSet.Rows[0][0].ToString() == "2" || dtResultSet.Rows[0][0].ToString() == "3")
                    {
                        sWatermarkText = dtResultSet.Rows[0][1].ToString();
                    }
                    else if (dtResultSet.Rows[0][0].ToString() == "4")
                    {
                        sWatermarkText = oConfig.AppSettings.Settings["Beehive.WatermarkText.Global"].Value.ToString();
                    }
                }
                if (sWatermarkText != "")
                {
                    sWatermarkText = sWatermarkText.Replace("$FIRST", firstName);
                    sWatermarkText = sWatermarkText.Replace("$LAST", lastName);
                    sWatermarkText = sWatermarkText.Replace("$DATE", DateTime.Now.ToString("dd-MMM-yyyy"));
                }

                //string sOutputPath = @"\\ac03ama1616\de$\tmp\cart";
                Impersonation.Impersonate();
                string sFileName = string.Empty;
                if (sFiles.Length > 0)
                {
                    for (int i = 0; i < sFiles.Length; i++)
                    {
                        //only for pdf report. If the cart has a video ignore adding watermark and copying to tmp/cart folder
                        if (sFiles[i].ToUpper().Contains(".PDF"))
                        {
                            //WaterMark.AddWatermark(sBeehiveFilePath + @"\pubs\" + sFiles[i], sBeehiveFilePath + @"\Tmp\Cart\" + Request.Cookies["UserId"].Value + '_' + sFiles[i], sWatermarkText, sPDFPassword);
                            Bernstein.IRS.TallPdf.Utilities objUtils = new Bernstein.IRS.TallPdf.Utilities(sBeehiveFilePath + @"\pubs\" + sFiles[i]);
                            objUtils.AddWatermark(sBeehiveFilePath + @"\pubs\" + sFiles[i], sBeehiveFilePath + @"\Tmp\Cart\" + userID + '_' + sFiles[i], sWatermarkText, "distribution");

                        }
                    }
                }
                Impersonation.Revert();
            }
            catch (Exception ex)
            {
                CommonFunc.DisplayException(ex);
            }
        }

        [HttpGet]
        public HttpResponseMessage getDistributionList(string userId)
        {
            string userName = string.Empty;
            CookieHeaderValue cookie = Request.Headers.GetCookies("UserID").FirstOrDefault();
            if (cookie != null)
            {
                userId = cookie["UserID"].Value;
                logger.Error("userID is ", userId);
            }

            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                SqlParameter[] sqlParams = new SqlParameter[1];
                sqlParams[0] = new SqlParameter("@UserID", int.Parse(userId));
                DataTable dtCart = dh.ExecuteDataTable("spApiGetUser", CommandType.StoredProcedure, sqlParams);
                userName = dtCart.Rows[0].ItemArray[2].ToString().ToLower();
            }
            List<string> sBlastLists = new List<string> { };
            try
            {
                string sBeehivePath = WebConfigurationManager.AppSettings["Beehive.Path"];
                XPathDocument doc = new XPathDocument(sBeehivePath + "files/resources/blastlists.xml");
                XPathNavigator nav = doc.CreateNavigator();
                XPathExpression expr2 = nav.Compile("/Root/BlastLists/BlastList/TeamMember[@windowsId='" + userName + "']");
                XPathNodeIterator iterator2 = nav.Select(expr2);
                if (iterator2.Count > 0)
                {
                    while (iterator2.MoveNext())
                    {
                        iterator2.Current.MoveToParent();
                        sBlastLists.Add(iterator2.Current.GetAttribute("id", "") + ';' + iterator2.Current.GetAttribute("name", "") + ';' + iterator2.Current.GetAttribute("analyst", ""));
                    }
                }

                XPathExpression expr = nav.Compile("/Root/BlastLists/BlastList[@windowsId='" + userName + "']");
                XPathNodeIterator iterator = nav.Select(expr);
                if (iterator.Count > 0)
                {
                    while (iterator.MoveNext())
                    {
                        sBlastLists.Add(iterator.Current.GetAttribute("id", "") + ';' + iterator.Current.GetAttribute("name", "") + ';' + iterator.Current.GetAttribute("analyst", ""));
                    }
                }

                IEnumerable<string> sDistinctLists = sBlastLists.Distinct();

                foreach (string sList in sDistinctLists)
                {
                    ListItem newlistitem = new ListItem();
                    newlistitem.Value = sList.Substring(0, sList.IndexOf(';'));
                    newlistitem.Text = sList.Substring(sList.IndexOf(';') + 1, sList.LastIndexOf(';') - sList.IndexOf(';'));
                    newlistitem.Attributes.Add("Title", newlistitem.Text + " (" + sList.Substring(sList.LastIndexOf(';') + 1) + ')');
                }
                Impersonation.Revert();
                JavaScriptSerializer jss = new JavaScriptSerializer();
                string distributionList = jss.Serialize(sBlastLists);
                return Request.CreateResponse(HttpStatusCode.OK, new { distributionList });
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getDistributionList message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
                response.Content = new StringContent("Error");
                return response;
            }

        }

        [HttpGet]
        public string GetIPAddress()
        {
            try
            {
                IPHostEntry ipHostInfo = Dns.GetHostEntry(Dns.GetHostName());

                foreach (IPAddress address in ipHostInfo.AddressList)
                {
                    if (address.AddressFamily == AddressFamily.InterNetwork)
                        return address.ToString();
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getClientIPAddress message:{0}", ex.Message);
                return string.Empty;
            }
            return string.Empty;
        }

        [Route("api/beehive/getContentUsage")]
        [HttpGet]
        public IHttpActionResult GetAllContentUsageData(String sWhere = "")
        {
            string sSQL = string.Empty;

            string connectionStringSalesLogix = ConfigurationManager.ConnectionStrings["SalesLogix"].ToString();
            string contentUsage = string.Empty;
            using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/_contentusage.sql"))
            {
                sSQL = sr.ReadToEnd();
            }
            sSQL = sSQL.Replace("--$WHERE", "");
            try
            {
                using (DataHelper dh = new DataHelper(connectionStringSalesLogix))
                {
                    DataTable dtContentUsage = dh.ExecuteDataTable(sSQL, CommandType.Text, null);
                    contentUsage = Newtonsoft.Json.JsonConvert.SerializeObject(dtContentUsage);
                }

                var result = new { ContentUsage = contentUsage };
                return Ok(result);
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getContentUsage message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent("Error")
                };
                return Ok(response);
            }
        }

        [Route("api/beehive/getContentUsageFilters")]
        [HttpGet]
        public IHttpActionResult GetAllContentUsageFilters(String sWhere = "")
        {
            string sSQL = string.Empty;
            string connectionStringResearch = ConfigurationManager.ConnectionStrings["Research"].ToString();
            string linkSources = string.Empty;
            string linkStatus = string.Empty;
            try
            {
                using (DataHelper dh = new DataHelper(connectionStringResearch))
                {
                    DataTable dtLinkSources = dh.ExecuteDataTable("spRenderGetLinkSources", CommandType.StoredProcedure);
                    DataTable dtLinkStatus = dh.ExecuteDataTable("spRenderLinkStatus", CommandType.StoredProcedure);
                    ContentUsageFiltersModel ContentUsageFilters = new ContentUsageFiltersModel
                    {
                        LinkSource = dtLinkSources.AsEnumerable().Select(data => new
                        {
                            Value = Convert.ToString(data["Value"]),
                            Display = Convert.ToString(data["Display"])
                        }).ToList(),
                        LinkStatus = dtLinkStatus.AsEnumerable().Select(data => new
                        {
                            Value = Convert.ToString(data["Value"]),
                            Display = Convert.ToString(data["Display"])
                        }).ToList()
                    };
                    return this.Ok(ContentUsageFilters);
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at getContentUsageFilters message:{0}", ex.Message);
                var response = new HttpResponseMessage(HttpStatusCode.InternalServerError)
                {
                    Content = new StringContent("Error")
                };
                return Ok(response);
            }
        }

        [Route("api/beehive/getResearchStats/")]
        [HttpGet]
        public IHttpActionResult ResearchReads(string analystId, string startDate, string endDate)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                var _connStringSlx = System.Configuration.ConfigurationManager.ConnectionStrings["SalesLogix"];
                string sSQL = string.Empty;

                using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/_researchreads.sql"))
                {
                    sSQL = sr.ReadToEnd();
                }
                sSQL = sSQL.Replace("$WhereClauseAuthor", analystId != "0" ? analystId : "''");
                sSQL = sSQL.Replace("$WhereClauseSinceDate", "'" + Convert.ToDateTime(startDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "'");
                sSQL = sSQL.Replace("$WhereClauseUntilDate", "'" + Convert.ToDateTime(endDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "'");

                using (DataHelper dh = new DataHelper(_connStringSlx.ConnectionString.ToString()))
                {
                    DataTable dt = dh.ExecuteDataTable(sSQL, CommandType.Text, null);
                    var researchReads = Newtonsoft.Json.JsonConvert.DeserializeObject(dt.DataTableToJson());
                    logger.Info("researchReads request end by {0}", ip);
                    return this.Ok(researchReads);
                }
            }
            catch (Exception ex)
            {
                logger.Error("Errors occured when processing the RetrieveSlx_SummaryUsage() method. ==>" + ex.Message.ToString());
                return this.Ok(ex.Message.ToString());
            }
        }

        [Route("api/beehive/researchReadsDetailsKey/")]
        [HttpGet]
        public IHttpActionResult ResearchReadsDetailsKey()
        {
            try
            {
                return this.Ok(ConfigurationManager.AppSettings["Enable.Links.Detail"]);
            }
            catch (Exception ex)
            {
                logger.Error("Errors occured when processing the ResearchReadsDetailsKey method. ==>" + ex.Message.ToString());
                return this.Ok(ex.Message.ToString());
            }
        }

        [Route("api/beehive/getModelStats/")]
        [HttpGet]
        public IHttpActionResult ModelDownloads(string dept, string startDate, string endDate)
        {
            string ip = Request.GetClientIpAddress();
            try
            {
                var _connStringSlx = System.Configuration.ConfigurationManager.ConnectionStrings["SalesLogix"];
                string sSQL = string.Empty;
                if (dept == "research")
                {
                    using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/_modeldownloads_research.sql"))
                    {
                        sSQL = sr.ReadToEnd();
                    }
                }
                else if (dept == "sales")
                {
                    using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/_modeldownloads_sales.sql"))
                    {
                        sSQL = sr.ReadToEnd();
                    }
                }
                string sWhereClause = "";
                sWhereClause = " WHERE CONVERT(date,AccessDate) >= '" + Convert.ToDateTime(startDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "' AND CONVERT(date,AccessDate) <='" + Convert.ToDateTime(endDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "'";
                sSQL = sSQL.Replace("--$WHERE", sWhereClause);
                using (DataHelper dh = new DataHelper(_connStringSlx.ConnectionString.ToString()))
                {
                    DataTable dt = dh.ExecuteDataTable(sSQL, CommandType.Text, null);
                    var modelDownloads = Newtonsoft.Json.JsonConvert.DeserializeObject(dt.DataTableToJson());
                    logger.Info("modelDownloads request end by {0}", ip);
                    return this.Ok(modelDownloads);
                }
            }
            catch (Exception ex)
            {
                logger.Error("Errors occured when processing the modelDownloads() method. ==>" + ex.Message.ToString());
                return this.Ok(ex.Message.ToString());
            }
        }

        [Route("api/beehive/getUsage/")]
        [HttpGet]
        public IHttpActionResult GetUsage(string type, string startDate, string endDate)
        {
            string sSQL = string.Empty;
            string sWhereClause = string.Empty;
            string connectionStringSalesLogix = ConfigurationManager.ConnectionStrings["SalesLogix"].ToString();

            if (type == "content")
            {
                using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/_contentusage.sql"))
                {
                    sSQL = sr.ReadToEnd();
                }
                sWhereClause = " WHERE CONVERT(date,AccessDate) >= '" + Convert.ToDateTime(startDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "' AND CONVERT(date,AccessDate) <='" + Convert.ToDateTime(endDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "'";
            }
            if (type == "events")
            {
                using (System.IO.StreamReader sr = new System.IO.StreamReader(System.Web.HttpContext.Current.Server.MapPath("~") + "/sqlxml/_eventusage.sql"))
                {
                    sSQL = sr.ReadToEnd();
                }
                sWhereClause = " WHERE CONVERT(date,UsageTime) >= '" + Convert.ToDateTime(startDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "' AND CONVERT(date,UsageTime) <='" + Convert.ToDateTime(endDate).ToString("yyyy-MM-dd HH:mm:ss.fff") + "'";
            }
            sSQL = sSQL.Replace("--$WHERE", sWhereClause);
            try
            {
                using (DataHelper dh = new DataHelper(connectionStringSalesLogix))
                {
                    DataTable dtContentUsage = dh.ExecuteDataTable(sSQL, CommandType.Text, null);
                    var data = Newtonsoft.Json.JsonConvert.DeserializeObject(dtContentUsage.DataTableToJson());
                    return this.Ok(data);
                }
            }
            catch (Exception ex)
            {
                logger.Error("Errors occured when processing the Content Usage method. ==>" + ex.Message.ToString());
                return this.Ok(ex.Message.ToString());
            }
        }

        [HttpGet]
        public HttpResponseMessage getLink(string type, string id = "", string source = "")
        {
            string ip = Request.GetClientIpAddress();
            //try
            //{
                string sEncryptedCid = "";
                string sLinksURL = "";
                string data = "";

                string sServerUrl = ConfigurationManager.AppSettings["ResearchLinks.Url"];
                string sDocumentType = "Research Call";   // get value from proc for PubNo

                EncryptURL oEncryptURL = new EncryptURL();
                sEncryptedCid = oEncryptURL.EncryptPayload(type, id, "1", "1", "1", source);
                oEncryptURL = null;

                if (type == "R")  
                { 
                    if (sDocumentType == "Video")   { sLinksURL = sServerUrl + "brweb/viewvideo.aspx"; }
                    if (sDocumentType == "Podcast") { sLinksURL = sServerUrl + "brweb/viewmedia.aspx"; }
                    else                            { sLinksURL = sServerUrl + "brweb/viewresearch.aspx"; }
                } 
                else if (type == "M")               { sLinksURL = sServerUrl + "brweb/viewmodel.aspx";    }
                else if (type == "A")               { sLinksURL = sServerUrl + "brweb/viewasset.aspx";    }
                else                                { sLinksURL = sServerUrl + "brweb/viewresearch.aspx"; }

                sLinksURL = sLinksURL + "?cid=" + sEncryptedCid;

                //format as json data
                data += "[{ ";
                data += "url :" + "'" + sLinksURL + "',";
                data += "cid :" + "'" + sEncryptedCid + "'";
                data += "}]";

                var val = Newtonsoft.Json.JsonConvert.DeserializeObject(data);

                logger.Info("getLink request end by {0}; type: {1}; id: {2}; source: {3}", ip, type, id, source);

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(val.ToString());

                return response;
            //}
            //catch (Exception ex)
            //{
            //    logger.Error("Exception at getLink message:{0}; source:{1}", ex.Message, ex.Source);
            //    var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            //    response.Content = new StringContent(ex.InnerException.ToString());
            //    return response;
            //}
        }

        [HttpGet]
        public HttpResponseMessage getHighlights(string id = "")
        {
            string ip = Request.GetClientIpAddress();
            //try
            //{
                string sHighlightsXml = "";

                Configuration oConfig = Bernstein.IRS.Utility.ScbSettings.GetConfigObject();
                string sResearchDB = oConfig.AppSettings.Settings["Research"].Value.ToString();
                oConfig = null;

                string sSQLXMLString = "spGetHighlightsXml " + id;

                // Get XML data from database
                sHighlightsXml = Database.RunXmlQuery(sResearchDB, sSQLXMLString);

                logger.Info("getHighlights request end by {0}; id: {1}", ip, id);

                var response = new HttpResponseMessage(HttpStatusCode.OK);
                response.Content = new StringContent(sHighlightsXml);
                return response;
            //}
            //catch (Exception ex)
            //{
            //    logger.Error("Exception at getHighlights message:{0}; source:{1}", ex.Message, ex.Source);
            //    var response = new HttpResponseMessage(HttpStatusCode.InternalServerError);
            //    response.Content = new StringContent(ex.InnerException.ToString());
            //    return response;
            //}
        }

        [HttpGet]
        public IHttpActionResult GetResearchCoverage(int userId)
        {
            DataTable dtResult = new DataTable();
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                SqlParameter[] sqlParams = new SqlParameter[1];
                sqlParams[0] = new SqlParameter("@UserId", userId);
                dtResult = dh.ExecuteDataTable("spApiGetResearchCoverage", CommandType.StoredProcedure, sqlParams);
            }
            return this.Ok(Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson()));
        }

        [HttpGet]
        public IHttpActionResult GetResearchCoverageDetail(int securityId)
        {
            DataTable dtResult = new DataTable();
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                SqlParameter[] sqlParams = new SqlParameter[1];
                sqlParams[0] = new SqlParameter("@SecurityID", securityId);
                dtResult = dh.ExecuteDataTable("spApiGetResearchCoverageDetail", CommandType.StoredProcedure, sqlParams);
            }
            return this.Ok(Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson()));
        }

        [HttpGet]
        public IHttpActionResult GetFacebookNames()
        {
            DataTable dtResult = new DataTable();
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                dtResult = dh.ExecuteDataTable("spApiGetFacebookNames", CommandType.StoredProcedure);
            }
            return this.Ok(Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson()));
        }

        [HttpGet]
        public IHttpActionResult GetDistributionSites()
        {
            DataTable dtResult = new DataTable();
            using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
            {
                dtResult = dh.ExecuteDataTable("spApiGetDistributionSites", CommandType.StoredProcedure);
            }
            return this.Ok(Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson()));
        }

        
        [HttpGet]
        public IHttpActionResult GetTickerList(int style)
        {           
            try
            {
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@Style", style);
                    DataSet ds = dh.ExecuteDataSet("spPickTickers", CommandType.StoredProcedure, sqlParams);
                    var tickers = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());                     
                    
                    return this.Ok(
                        new
                        {
                            Tickers = tickers
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spPickList message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        [HttpGet]
        public IHttpActionResult GetAnalystsList(int Style)
        {
            try
            {
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@Style", Style);
                    DataSet ds = dh.ExecuteDataSet("spPickAuthors", CommandType.StoredProcedure, sqlParams);
                    var analysts = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());

                    return this.Ok(
                        new
                        {
                            Analysts = analysts
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spPickAuthors message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }
        [HttpGet]
        public IHttpActionResult GetIndustriesList(int style)
        {
            try
            {
                DataTable dtResult = new DataTable();
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@Style", style);
                    DataSet ds = dh.ExecuteDataSet("spPickIndustries", CommandType.StoredProcedure, sqlParams);
                    var industries = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());

                    return this.Ok(
                        new
                        {
                            Industries = industries
                        }
                    );
                }
            }
            catch (Exception ex)
            {
                logger.Error("Exception at spPickIndustries message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }
        public Tuple<string,string> getResearchTextSearchValue(string searchString)
        {
            try
            {               
                using (DataHelper dh = new DataHelper(CommonFunc.ResearchConnectionString()))
                {
                    SqlParameter[] sqlParams = new SqlParameter[1];
                    sqlParams[0] = new SqlParameter("@SearchString", searchString);
                    //DataSet ds = dh.ExecuteDataSet("spGetMetaDataIdForSearchString", CommandType.StoredProcedure, sqlParams);
                    DataTable ds = dh.ExecuteDataTable("spGetMetaDataIdForSearchString", CommandType.StoredProcedure, sqlParams);
                    // var response = Newtonsoft.Json.JsonConvert.DeserializeObject(ds.Tables[0].DataTableToJson());
                    //var res = Newtonsoft.Json.JsonConvert.DeserializeObject(ds);
                    var ticker = ds.Rows[0][0]?.ToString();
                    var author = ds.Rows[0][1]?.ToString();
                    var type = ds.Rows[0][2]?.ToString();
                    if(ticker!=null && ticker!="")
                    return new Tuple<string, string>("ticker.id",ticker);
                    else if (author != null && author!="")
                        return new Tuple<string, string>("author.id", author);
                    else if(type !=null && type!="")
                        return new Tuple<string, string>("typeId", type);
                    else
                        return new Tuple<string, string>("", "");
                }
            }
            catch (Exception ex)
            {
                DBLogger.Error("controllerName", "actionName", "methodType", "appName",
                                  "message", "payload", "url", "userName");
                logger.Error("Exception at getResearchTextSearchValue message:{0}", ex.Message);
                return null;
            }


        }

        [HttpGet]
        public IHttpActionResult GetMeetingReplays()
        {
            try
            {
                DataTable dt = this.GetData();
                return this.Ok(Newtonsoft.Json.JsonConvert.DeserializeObject(dt.DataTableToJson()));
            }
            catch (Exception ex)
            {
                logger.Error("Exception at meetingList message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

       // [Route("api/GetMeetingReplays/Historial/")]
        [HttpGet]
        public IHttpActionResult GetMeetingReplaysHistorial(string MeetingName)
        {           
            try
            {

                DataTable dt = this.GetFiles(MeetingName);               
                return this.Ok(Newtonsoft.Json.JsonConvert.DeserializeObject(dt.DataTableToJson()));
            }
            catch (Exception ex)
            {
                logger.Error("Exception at meetingList message:{0}", ex.Message);
                return this.Ok(ex.Message);
            }
        }

        private DataTable GetData()
        {
            Impersonation.Impersonate();
            string sMeetingAudioPath = ConfigurationManager.AppSettings["Meeting.Audio.Path"];
            string jsonFromFile = string.Empty;
            using (var reader = new StreamReader(sMeetingAudioPath + "replays.json"))
            {
                jsonFromFile = reader.ReadToEnd();
            }
            dynamic meetings = Newtonsoft.Json.JsonConvert.DeserializeObject<List<MeetingReplay>>(jsonFromFile);
          
            DataTable dt = new DataTable();
            dt.Columns.AddRange(new DataColumn[5] {
                    new DataColumn("Meeting", typeof(string)),
                    new DataColumn("Recording_Date",typeof(string)),
                    new DataColumn("Size", typeof(string)),
                    new DataColumn("File", typeof(string)),
                    new DataColumn("Message", typeof(string))});



            foreach (var item in meetings)
            {
                dynamic creationTime = "Not Available", size = "";
                //  var filename = item.filepath.Replace("/", "") + ".m4a";               
                var filename = item.file;
                if (!File.Exists(sMeetingAudioPath + filename))
                {
                    filename = item.file.Substring(0, item.file.Length - 4);
                    filename = filename + ".mp3";
                }
                if (File.Exists(sMeetingAudioPath + filename))
                {
                    creationTime = File.GetLastWriteTime(sMeetingAudioPath + filename).ToString("dd-MMM-yyyy");
                    FileInfo f1 = new FileInfo(sMeetingAudioPath + filename);
                    size = Math.Round(Convert.ToDouble(f1.Length / (1024.0 * 1024.0)), 1).ToString("0.0") + " MB";
                }
                dt.Rows.Add(item.replay, creationTime, size, filename, item.message);
            }
            return dt;

        }

        private DataTable GetFiles(string MeetingName)
        {
            Impersonation.Impersonate();
            string sMeetingAudioPath = ConfigurationManager.AppSettings["Meeting.Audio.Path"];
            string jsonFromFile = string.Empty;
            using (var reader = new StreamReader(sMeetingAudioPath + "replays.json"))
            {
                jsonFromFile = reader.ReadToEnd();
            }
            dynamic meetings = Newtonsoft.Json.JsonConvert.DeserializeObject<List<MeetingReplay>>(jsonFromFile); 

            DataTable dtMeetingHistoryData = new DataTable();
            dtMeetingHistoryData.Columns.AddRange(new DataColumn[5] {
                        new DataColumn("Meeting", typeof(string)),
                        new DataColumn("Recording_Date",typeof(string)),
                        new DataColumn("Size", typeof(string)),
                        new DataColumn("File", typeof(string)),
                        new DataColumn("Message", typeof(string))});
             
            foreach (var item in meetings)
            {
                if(item.replay==MeetingName)
                {
                    dynamic creationTime = "Not Available", size = "";
                    dynamic path = item.file.Substring(0,item.file.LastIndexOf("/"));
                     
                    string sMeetingFilePath = ConfigurationManager.AppSettings["Meeting.Audio.Path"] + path; 
                    //  var filename = item.filepath.Replace string sMeetingAudioPath = ConfigurationManager.AppSettings["Meeting.Audio.Path"];
                    var directory = new DirectoryInfo(sMeetingFilePath);

                    var files = directory.GetFiles()?
                                 .OrderByDescending(f => f.LastWriteTime)
                                 .Take(30);

                    foreach (var file in files)
                    {
                        var filename = file.Name.Substring(0, file.Name.Length - file.Extension.Length);
                        var sMeetingSubFilePath = Path.Combine(sMeetingFilePath + "\\" + file.Name);
                        if (File.Exists(sMeetingSubFilePath))
                        {
                            creationTime = File.GetLastWriteTime(sMeetingSubFilePath).ToString("dd-MMM-yyyy");
                            FileInfo f1 = new FileInfo(sMeetingSubFilePath);
                            size = Math.Round(Convert.ToDouble(f1.Length / (1024.0 * 1024.0)), 1).ToString("0.0") + " MB";
                        }
                        //dtMeetingHistoryData.Rows.Add(file.Name, creationTime, size, path+"/"+file.Name, item.message);
                        dtMeetingHistoryData.Rows.Add("", creationTime, size, path + "/" + file.Name, "");
                    }
                }
                
            }
            return dtMeetingHistoryData;
        }

    }
}
