using Bernstein.IRS.Beehive.Api.Utility;
using Bernstein.IRS.Web.BlueMatrix;
using Bernstein.IRS.Web.BlueMatrix.Models;
using System;
using System.Collections.Generic;
using System.Data;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Text;
using System.Web.Http;
using System.Xml.Serialization;
using System.Linq;
using Bernstein.IRS.Utility;

namespace Bernstein.IRS.Web.Controllers
{
    public class BlueMatrixController : ApiController
    {
        Utilities bmUtilities;
        BMData bmData;
        Publications publications;
        public BlueMatrixController()
        {
            bmUtilities = new Utilities();
            bmData = new BMData();
            publications = new Publications();
        }

        [Route("api/BlueMatrix/People/")]
        public HttpResponseMessage GetPeople(string param, string test = "",string process="")
        {
            string url = bmUtilities.GetChangeFeedUrl("people", param,test); 
            string xml = bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                if (bmData.UpdateResearchDB(xml, "@peopleXml", "spLoadBMStagingPeople"))
                {
                    if (process == "true")
                    {
                        bmData.UpdateResearchDB(null, null, "spProcessBmPeople");
                    }
                    return customHttpResponse(xml);
                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update XML data in Research DB"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download BlueMatrix XML data"));
            }

        }

        [Route("api/BlueMatrix/Industries/")]
        public HttpResponseMessage GetIndustries(string param, string test = "",string process="")
        {
            string url = bmUtilities.GetChangeFeedUrl("industry", param, test);
            string xml = bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                if (bmData.UpdateResearchDB(xml, "@industryXml", "spLoadBMStagingIndustries"))
                {
                    if (process == "true")
                    {
                        bmData.UpdateResearchDB(null, null, "spProcessBmIndustries");
                    }
                    return customHttpResponse(xml);
                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update XML data in Research DB"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }

        }

        [Route("api/BlueMatrix/Securities/")]
        public HttpResponseMessage GetSecurities(string param, string test = "",string process="")
        {
            string url = bmUtilities.GetChangeFeedUrl("issuer", param, test);
            string xml = bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                if (bmData.UpdateResearchDB(xml, "@securityXml", "spLoadBMStagingSecurities"))
                {
                    if (process == "true")
                    {
                        bmData.UpdateResearchDB(null, null, "spProcessBmSecurities");
                    }
                    return customHttpResponse(xml);
                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update XML data in Research DB"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }

        }
      
        [Route("api/BlueMatrix/Roles/")]
        public HttpResponseMessage GetRoles(string param, string test = "")
        {
            string url = bmUtilities.GetChangeFeedUrl("role", param, test);
            string xml =bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                if (bmData.UpdateResearchDB(xml, "@rolesXml", "spLoadBMStagingRoles"))
                {
                    return customHttpResponse(xml);
                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update XML data in Research DB"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }

        }

        [Route("api/BlueMatrix/Events/")]
        public HttpResponseMessage GetEvents(string fromEventId = "",string test = "")
        {
            string url = bmUtilities.GetChangeFeedEventUrl(fromEventId, test);
            string xml = bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                XmlSerializer serializer = new XmlSerializer(typeof(DataFeed));
                using (StringReader reader = new StringReader(xml))
                {
                    var dataFeed = (DataFeed)serializer.Deserialize(reader);

                    //Updating DownloadDataproperty in all the items
                    dataFeed.ChangeEvent.ForEach(x => x.DownloadedOn = DateTime.Now);

                    //Append failed xml data from Research database
                    //List<ChangeEvent> failedEvents = GetBMFailedEvents();
                    //List<ChangeEvent> bmEvents = failedEvents.Count > 0 ? dataFeed.ChangeEvent.Concat(GetBMFailedEvents()).ToList() : dataFeed.ChangeEvent;

                    List<ChangeEvent> changeEvents = bmData.DownloadData(dataFeed.ChangeEvent, test);
                }
                return customHttpResponse(xml);
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }
        }

        [Route("api/BlueMatrix/FailedEvents/")]
        public HttpResponseMessage GetFailedEvents()
        {
            List<ChangeEvent> failedEvents = bmData.GetBMFailedEvents();

            if(failedEvents.Count > 0)
            {
                failedEvents.ForEach(x => x.DownloadedOn = DateTime.Now);
                failedEvents = bmData.DownloadData(failedEvents,"",true);
            }
            return Request.CreateResponse(HttpStatusCode.OK); 
        }


        [Route("api/BlueMatrix/CustomTags/")]
        public HttpResponseMessage GetCustomTags(string param, string test = "",string process="")
        {
            string url = bmUtilities.GetChangeFeedUrl("tagging", param, test);
            string xml = bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                if (bmData.UpdateResearchDB(xml, "@customTagsXml", "spLoadBmStagingCustomTags"))
                {
                    if (process == "true")
                    {
                        bmData.UpdateResearchDB(null, null, "spProcessBmCustomTags");
                     
                    }
                    return customHttpResponse(xml);
                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update XML data in Research DB"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }

        }

        [Route("api/BlueMatrix/DocumentTypes/")]
        public HttpResponseMessage GetDocumentTypes(string test = "")
        {
            string url = bmUtilities.GetChangeFeedUrl("contentMeta", "full", test);
            string xml = bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                if (bmData.UpdateResearchDB(xml, "@documentTypesXml", "spLoadBmDocumentTypes"))
                {
                    return customHttpResponse(xml);
                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update XML data in Research DB"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }

        }

        [Route("api/BlueMatrix/Elements/")]
        public HttpResponseMessage GetElements(string test = "")
        {
            string url = bmUtilities.GetChangeFeedUrl("elements", "full", test);
            string xml = bmUtilities.GetBlueMatrixXML(url, test);
            if (!string.IsNullOrEmpty(xml))
            {
                if (bmData.UpdateResearchDB(xml, "@elementsXml", "spLoadBmElements"))
                {
                    return customHttpResponse(xml);
                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update XML data in Research DB"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }

        }

        [Route("api/BlueMatrix/Content/")]
        public HttpResponseMessage GetContent(string param = "", string test = "")
        {
            string url = bmUtilities.GetChangeFeedUrl("content", param, test);
            string xml = bmUtilities.GetBlueMatrixXML(url, test);

            Tuple<bool, string,bool> result = publications.DownloadPublishedDocument(xml, test);
            
            if (result.Item1 && result.Item3)
            {
                return customHttpResponse(result.Item2);
            }
            else if(!result.Item3)
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "It is not listed report for process"));
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download XML data of BlueMatrix"));
            }
        }

        [HttpPost]
        [Route("api/BlueMatrix/ProductGroups/")]
        public HttpResponseMessage GetProductGroups([FromBody] Entitlements entitlements, [FromUri] string test="", [FromUri] bool process = false)
        {
            string url = String.Format(bmUtilities.PostProductGroupUrl(test));
            string json = bmUtilities.PostBlueMatrixJSON(entitlements, url, test);
            if (!string.IsNullOrEmpty(json))
            {
                if (!process)
                {
                    if (bmData.UpdateResearchDB(json, "@JSON", "spLoadBmEntitlements"))
                    {
                        return customHttpResponse(json, "json");
                    }
                    else
                        throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update Staging table data to Research DB"));

                }
                else
                {
                    if (bmData.UpdateResearchDB(json, "@JSON", "spLoadBmEntitlements"))
                    {
                        if (bmData.UpdateResearchDB(null, null, "spProcessBmProductGroups"))
                        {
                            bmData.UpdateResearchDB("Product Groups", "@ChangeFeedObject", "spChangeFeedLog");
                            bmData.UpdateResearchDB("Product Group Fields", "@ChangeFeedObject", "spChangeFeedLog");
                            return customHttpResponse(json, "json");
                        }
                        else
                            throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update Staging table data to Research DB"));
                    }
                    else
                    {
                        throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update JSON data in Research DB"));
                    }
                }
                
            }

            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to download JSON data of BlueMatrix"));
            }
        }
     
        [Route("api/BlueMatrix/ChangeFeedEvents/")]
        public IHttpActionResult GetChangeFeedEvents(string fromDate, string toDate)
        {
            DataTable dtResult = bmData.GetEvents(fromDate,toDate);
            return Ok(Newtonsoft.Json.JsonConvert.DeserializeObject(dtResult.DataTableToJson()));
        }

        
        [Route("api/BlueMatrix/UpdateChangeFeedStatus/")]
        [HttpGet]
        public IHttpActionResult UpdateChangeFeedStatus(int eventId, string status)
        {
            return Ok(bmData.UpdateEventStatus(eventId, status));
        }

        [HttpPost]
        [Route("api/BlueMatrix/ChangeFeedXml/")]
        public HttpResponseMessage GetChangeFeedXml([FromBody] BmURL url)
        {
            string xmlData = string.Empty;
            if (url.FeedName.ToLower() == "content")
            {
                string firstXml= bmUtilities.GetBlueMatrixXML(url.Url, "");
                var tuple = publications.GetPublishedDocPath(firstXml);
                xmlData = tuple != null && tuple.Item1 != null ? bmUtilities.GetBlueMatrixXML(tuple.Item1, "") : firstXml;
            }
            else
            {
                xmlData = bmUtilities.GetBlueMatrixXML(url.Url, "");
            }
            return  customHttpResponse(xmlData);
        }
       
        private dynamic customHttpResponse(string input,string type="xml")
        {
            var result = Request.CreateResponse(HttpStatusCode.OK);
            result.Content = type == "json" ? new StringContent(input, Encoding.UTF8, "Application/json") : new StringContent(input, Encoding.UTF8, "text/xml");
            return result;
        }

        [Route("api/BlueMatrix/Valuations/")]
        public HttpResponseMessage GetValuations(string test = "")
        {
            Impersonation.Impersonate();
            // var directory = new DirectoryInfo(@"\\researchfs\researchdev\Content\PRDCTL\in\BMValuations");
            string url = bmUtilities.GetValuationUrl();
            var directory = new DirectoryInfo(url);
            var security_ratioFile = directory.GetFiles()?
                         .OrderBy(f => f.LastWriteTime)
                         .FirstOrDefault();
            string json = "";
            // string json = "{\"1\":[{\"id\":1,\"name\":\"P/E\",\"order\":null,\"hide\":false,\"values\":[{\"year\":2019,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2020,\"displayValue\":\"0.57\",\"rawValue\":0.56854},{\"year\":2021,\"displayValue\":\"0.03\",\"rawValue\":0.0290071429},{\"year\":2022,\"displayValue\":\"0.47\",\"rawValue\":0.4737833333}],\"formula\":{\"formula\":\"[21]/{1}\",\"translatedFormula\":\"[Close Price]/{EPS}\"}},{\"id\":9,\"name\":\"P/CFO\",\"order\":null,\"hide\":false,\"values\":[{\"year\":2019,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2020,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2021,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2022,\"displayValue\":\"--\",\"rawValue\":null}],\"formula\":{\"formula\":\"[21]/{15}\",\"translatedFormula\":\"[Close Price]/{CFO/Share}\"}},{\"id\":5,\"name\":\"EV/EBITA\",\"order\":null,\"hide\":false,\"values\":[{\"year\":2019,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2020,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2021,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2022,\"displayValue\":\"--\",\"rawValue\":null}],\"formula\":{\"formula\":\"[219]/{22}\",\"translatedFormula\":\"[Enterprise Value ($M)]/{EBITA}\"}}],\"634\":[{\"id\":1,\"name\":\"P/E\",\"order\":null,\"hide\":false,\"values\":[{\"year\":2019,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2020,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2021,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2022,\"displayValue\":\"--\",\"rawValue\":null}],\"formula\":{\"formula\":\"[21]/{1}\",\"translatedFormula\":\"[Close Price]/{EPS}\"}},{\"id\":14,\"name\":\"EV/EBIT\",\"order\":null,\"hide\":false,\"values\":[{\"year\":2019,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2020,\"displayValue\":\"40.27\",\"rawValue\":40.2736951226},{\"year\":2021,\"displayValue\":\"30.90\",\"rawValue\":30.9042182134},{\"year\":2022,\"displayValue\":\"25.94\",\"rawValue\":25.9370393521}],\"formula\":{\"formula\":\"[249]/{21}\",\"translatedFormula\":\"[EV]/{EBIT}\"}},{\"id\":10,\"name\":\"P/Sales\",\"order\":null,\"hide\":false,\"values\":[{\"year\":2019,\"displayValue\":\"--\",\"rawValue\":null},{\"year\":2020,\"displayValue\":\"15.52\",\"rawValue\":15.5236305048},{\"year\":2021,\"displayValue\":\"13.19\",\"rawValue\":13.1926061159},{\"year\":2022,\"displayValue\":\"11.34\",\"rawValue\":11.3352941176}],\"formula\":{\"formula\":\"[21]/{48}\",\"translatedFormula\":\"[Close Price]/{Revenue/Share}\"}}]}";
            // string FilePath = @"\\researchfs\researchdev\Content\PRDCTL\in\BMValuations\security_ratio_20210824.json";
            if (security_ratioFile != null)
            {
                json = File.ReadAllText(security_ratioFile.FullName);
                if (!string.IsNullOrEmpty(json) && security_ratioFile != null)
                {
                    if (bmData.UpdateResearchDB(json, "@JSON", "spProcessBmValuations"))
                    {
                        string destinationFile = url + "\\Processed\\";
                        string destinationFileName = Path.Combine(destinationFile + security_ratioFile.Name);
                        if (File.Exists(destinationFileName))
                        {
                            //File.Delete(destinationFileName); 
                            FileInfo fi = new FileInfo(destinationFileName);
                            var filename = fi.Name.Substring(0, fi.Name.Length - fi.Extension.Length) + DateTime.Now.ToString("yyyyMMddhhmm") + fi.Extension;
                            destinationFileName = Path.Combine(destinationFile + filename);
                            System.IO.File.Move(security_ratioFile.FullName, destinationFileName);
                        }
                        else
                            System.IO.File.Move(security_ratioFile.FullName, destinationFileName);


                        Impersonation.Revert();
                        return customHttpResponse(json, "json");
                    }
                    else
                        throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to update Staging table data to Research DB"));

                }
                else
                {
                    throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "Unable to read JSON File"));
                }
            }
            else
            {
                throw new HttpResponseException(Request.CreateErrorResponse(HttpStatusCode.InternalServerError, "No JSON file found"));
            }



        }


    }
}
