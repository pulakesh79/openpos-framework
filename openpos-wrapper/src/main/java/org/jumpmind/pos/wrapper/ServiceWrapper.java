package org.jumpmind.pos.wrapper;

import java.io.File;
import java.io.IOException;
import java.util.Scanner;

import org.jumpmind.symmetric.wrapper.WrapperHelper;

public class ServiceWrapper {

    protected static final String SYS_CONFIG_DIR = "org.jumpmind.pos.config.dir";
    protected static final String OPENPOS_HOME = "OPENPOS_HOME";

    public static void main(String[] args) throws Exception {

        String configFileName = "config/openpos_service.conf";

        String appHomeDir = getHomeDir();

        WrapperHelper.run(args, appHomeDir, appHomeDir + File.separator + configFileName, "../lib/openpos-server.jar");
    }


    static String convertStreamToString(java.io.InputStream is) throws IOException {
        Scanner scanner = new Scanner(is);
        java.util.Scanner s = scanner.useDelimiter("\\A");
        String result = s.hasNext() ? s.next() : "";
        s.close();
        scanner.close();
        is.close();
        return result;
    }

    protected static boolean isBlank(String value) {
        return value == null || value.trim().equals("");
    }
    
    protected static String getHomeDir() {
        String homeDir = System.getenv(OPENPOS_HOME);
        if (isBlank(homeDir)) {
            homeDir = System.getProperty("user.dir");
        }
        return homeDir;
    }
    
}
