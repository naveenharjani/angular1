(function (window) {
  window.__env = window.__env || {};

  // API url
  window.__env.apiUrl = 'http://localhost:63885/api/beehiveapi/';
  window.__env.enableDebug = true;

  // Whether or not to enable debug mode
  // Setting this to false will disable console output
  window.__env.enableDebug = true;



  window.__env.app = "Beehive",
    window.__env.baseUrl = 'http://localhost:63885/api/beehive/',
    window.__env.integratedBaseUrl = 'http://localhost:63885/api/',
    window.__env.autoCompleteUrl = 'http://localhost:63885/api/beehive/getSearchAutocomplete',
    window.__env.gridUrl = 'http://api1-dr.beehive.com/api/beehive/',
    window.__env.bernsteinLogo = '/images/bernstein_logo.png',
   window.__env.tickerSearchUrl = '/research/research.asp?ticker={0}',
   //window.__env.tickerSearchUrl = '/html/index.html?v=011520210041#/research?ticker={0}'
   //window.__env.analystSearchUrl = '/research/research.asp?analyst={0}',
   window.__env.analystSearchUrl = '/html/index.html?v=011520210041#/research?analyst={0}',
   //window.__env.freeTextSearchUrl = '/research/research.asp?text={0}',
window.__env.freeTextSearchUrl = '/html/index.html?v=011520210041#/research?text={0}',
   window.__env.financialsSearchUrl = '/research/estimates.aspx?analystid=-1&ticker={0}&max=1000',
   window.__env.chartSearchUrl = '../charts/PriceCharts.aspx$?type=threeyrpricechart&ticker={0}',
   //    window.__env.modelSearchUrl = '/research/models.aspx?analystid=&ticker={0}',
   window.__env.modelSearchUrl = '/html/index.html?v=011520210041#/models?ticker={0}',
   window.__env.cartUrl = '/html/index.html?v=011520210041#/cart',
    window.__env.textSearchEnabled = true,
    window.__env.showTypeaheadContent = true,
    window.__env.AssetsConfirmMessage = "Are you sure?",
    window.__env.AssetsExpiryDays = '90',
    window.__env.AssetsValidationMessage = 'Please fill in all non-optional fields',
    window.__env.SiteUrl = 'http://institutional-poc.beehive.com/',
    window.__env.DownloadsFromDays = 5,
    window.__env.UsageFromDays = 2,
    window.__env.menuLocation='/angular-dist/menu.html',

    window.__env.researchscreen = [
      {
          ControlName: "Tickers",
          PropName: "ticker.id"
      },
      {
      ControlName: "Industries",
      PropName: "industry.id"
      },
      {
      ControlName: "Analysts",
      PropName: "author.id"
      },
      {
      ControlName: "Authors",
      PropName: "author.id"
      },
      {
      ControlName: "Type",
      PropName: "typeId"
      },
      {
      ControlName: "SubType",
      PropName: "subType"
      },
      {
      ControlName: "Keyword",
      PropName: "keyword.id"
      },
      {
      ControlName: "Investorthemes",
      PropName: "investortheme.id"
      },
      {
      ControlName: "Thematictag",
      PropName: "thematictagid"
      },
      {
      ControlName: "Coverageaction",
      PropName: "ticker.coverageAction"
      },
      {
      ControlName: "Ratingaction",
      PropName: "ticker.ratingAction"
      },
      {
      ControlName: "Targetpriceaction",
      PropName: "ticker.targetPriceAction"
      },
      {
      ControlName: "Estimateaction",
      PropName: "ticker.estimateAction"
      },
      {
      ControlName: "Since",
      PropName: "since"
      },
      {
      ControlName: "Until",
      PropName: "until"
      },
      {
      ControlName: "Text",
      PropName: "text"
      },
      {
      ControlName: "PUBNO",
      PropName: "pubno"
      }
      ],
    window.__env.advancedSearchFields = [
      {
        FieldName: "Tickers",
        FieldValue: "ticker.id",
        FormType: "Dropdown",
        FormPosition: "Main",
        ControlName: "Tickers"
        },
        {
        FieldName: "Industries",
        FieldValue: "industry.id",
        FormType: "Dropdown",
        FormPosition: "Main",
        ControlName: "Industries"
        },
        {
        FieldName: "Analysts",
        FieldValue: "author.id",
        FormType: "Dropdown",
        FormPosition: "Main",
        ControlName: "Analysts"
        },
        {
          FieldName: "Authors",
          FieldValue: "author.id",
          FormType: "Dropdown",
          FormPosition: "Main",
          ControlName: "Authors"
          },
        {
        FieldName: "Type",
        FieldValue: "typeId",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Type"
        },
  
        {
        FieldName: "SubType",
        FieldValue: "subType",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "SubType"
        },
        {
        FieldName: "Keyword",
        FieldValue: "keyword.id",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Keyword"
        },
        {
        FieldName: "Investor Theme",
        FieldValue: "investorTheme.id",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Investorthemes"
        },
        {
        FieldName: "Thematic Tags",
        FieldValue: "thematicTagId",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Thematictag"
        },
        {
        FieldName: "Coverage Action",
        FieldValue: "ticker.coverageAction",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Coverageaction"
        },
        {
        FieldName: "Rating Action",
        FieldValue: "ticker.ratingAction",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Ratingaction"
        },
        {
        FieldName: "Target Price Action",
        FieldValue: "ticker.targetPriceAction",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Targetpriceaction"
        },
        {
        FieldName: "Estimate Action",
        FieldValue: "ticker.estimateAction",
        FormType: "Dropdown",
        FormPosition: "Rest",
        ControlName: "Estimateaction"
        },       
        {
        FieldName: "Since",
        FieldValue: "since",
        FormType: "Date",
        FormPosition: "Main",
        ControlName: "Since"
        },
        {
        FieldName: "Until",
        FieldValue: "until",
        FormType: "Date",
        FormPosition: "Rest",
        ControlName: "Until"
        },
        {
        FieldName: "Title",
        FieldValue: "title",
        FormType: "Text",
        FormPosition: "Rest",
        ControlName: ""
        },
        {
        FieldName: 'Text',
        FieldValue: "text",
        FormType: "Text",
        FormPosition: "Main1",
        ControlName: "Text"
        },
        {
        FieldName: 'PubNo',
        FieldValue: "pubno",
        FormType: "Text",
        FormPosition: "Rest",
        ControlName: "PUBNO"
        }
        ],

    window.__env.menuItems = [
      {
        Id: 1,
        Label: 'HOME',
        Url: '/research/default.asp'
      },
      {
        Id: 2,
        Label: 'RESEARCH',
        Url: '/research/research.asp'
      },
      {
        Id: 3,
        Label: 'FINANCIALS',
        Url: '/research/estimates.aspx'
      },
      {
        Id: 4,
        Label: 'MODELS',
        Url: '/html/index.html?v=2#/models'
      },
      {
        Id: 5,
        Label: 'DECKS+',
        Url: '/html/index.html?v=2#/assets'
      },

      {
        Id: 6,
        Label: 'DISCLOSURES',
        Url: '/disclosures/menu.asp'
      },
      {
        Id: 7,
        Label: 'POC',
        Url: '#',
        SubMenu:
          [
            { Id: 1, Label: 'RESEARCH', Url: "/html/index.html?v=2#/research" },
            { Id: 2, Label: 'INDUSTRIES', Url: "/html/index.html?v=2#/industries" },
            { Id: 3, Label: 'SECURITIES', Url: '/html/index.html?v=2#/securities' },
            { Id: 4, Label: 'PRODUCT GROUPS', Url: "/html/index.html?v=2#/product-groups" },
            { Id: 5, Label: 'DATA GRID', Url: "/html/index.html?v=2#/datagrid" },
            { Id: 6, Label: 'QUOTA', Url: "/html/index.html?v=2#/quota" },
            { Id: 7, Label: 'DOWNLOAD STATS - RESEARCH', Url: "/html/index.html?v=2#/research-reads" },
            { Id: 8, Label: 'DOWNLOAD STATS - MODELS', Url: '/html/index.html?v=2#/model-downloads' },
            { Id: 9, Label: 'RAW USAGE - CONTENT', Url: "/html/index.html?v=2#/content-usage" },
            { Id: 10, Label: 'RAW USAGE - EVENTS', Url: "/html/index.html?v=2#/events-usage" },
            { Id: 11, Label: 'RAW USAGE - WEB', Url: "/html/index.html?v=2#/research-reads" },
            { Id: 12, Label: 'ASHISH RESEARCH', Url: "/html/index.html?v=2#/research1" },
            { Id: 13, Label: 'RESEARCH COVERAGE', Url: "/html/index.html?v=2#/research-coverage" },
            { Id: 14, Label: 'CALENDER TEST', Url: "/html/index.html?v=2#/calender" },
            { Id: 15, Label: 'FACEBOOK', Url: "/html/index.html?v=2#/facebook" },
            { Id: 16, Label: 'DISTRIBUTION SITES', Url: "/html/index.html?v=2#/distribution-sites" },
            { Id: 17, Label: 'RESEARCH 5', Url: "/html/index.html?v=2#/style" }
          ]
      }
    ],



    window.__env.gridFilters = [
      {
        "Display": "Content Usage (CRM)",
        "Value": "_contentusage"
      },
      {
        "Display": "Web Usage (CRM)",
        "Value": "_webusage"
      },
      {
        "Display": "Quota (CRM)",
        "Value": "_quota"
      },
      {
        "Display": "Trending Readership (CRM)",
        "Value": "_trending_readership"
      },
      {
        "Display": "Bernstein Reads (CRM)",
        "Value": "_bernsteinreads"
      },
      {
        "Display": "Portal Clicks by Account (CRM)",
        "Value": "_portalclicksCRM"
      },
      {
        "Display": "Authors",
        "Value": "authors"
      },
      {
        "Display": "Securities",
        "Value": "securities"
      },
      {
        "Display": "Coverage",
        "Value": "coverage"
      },
      {
        "Display": "Product Groups",
        "Value": "productgroups"
      },
      {
        "Display": "Distribution Sites",
        "Value": "distributionsites"
      },
      {
        "Display": "Portal Clicks (by email domain)",
        "Value": "portalclicks"
      },
      {
        "Display": "Portal Clicks (by account)",
        "Value": "portalclicks2"
      },
      {
        "Display": "Top Portal Contacts",
        "Value": "topportalcontacts"
      },
      {
        "Display": "Portal Embargo",
        "Value": "portalembargo"
      },
      {
        "Display": "Portal Load Log",
        "Value": "portalloadlog"
      },
      {
        "Display": "File Processing Log",
        "Value": "fileprocessinglog"
      }
    ]




}(this));
