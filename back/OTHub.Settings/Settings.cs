﻿using System;
using Microsoft.Extensions.Configuration;

namespace OTHub.Settings
{
    // parameters for all settings : blockchain, webserver, mariadb, etc ...
    public class OTHubSettings
    {

        public MariaDBSettings MariaDB { get; set; }
        public WebServerSettings WebServer { get; set; }
        public MarketSettings Market { get; set; }

        public static OTHubSettings Instance { get; private set; }
    
        public OTHubSettings()
        {
            Instance = this;
        }

        public void Validate()
        {

            if (MariaDB == null)
            {
                throw new Exception("Invalid or missing MariaDB settings");
            }

            MariaDB.Validate();

            if (WebServer == null)
            {
                throw new Exception("Invalid or missing WebServer settings");
            }

            WebServer.Validate();
        }
    }

    public class MarketSettings
    {
        public string CoinMarketCapAPIKey { get; set; }
    }

}