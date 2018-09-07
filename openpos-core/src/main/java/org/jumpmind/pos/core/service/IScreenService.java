package org.jumpmind.pos.core.service;

import org.jumpmind.pos.core.flow.IScreenInterceptor;
import org.jumpmind.pos.core.screen.Screen;

public interface IScreenService {

    public void showScreen(String appId, String nodeId, Screen screen);
    
    public Screen getLastScreen(String appId, String nodeId);
    
    public Screen getLastDialog(String appId, String nodeId);
    
    public void addScreenInterceptor(IScreenInterceptor interceptor);
    
    public void removeScreenInterceptor(IScreenInterceptor interceptor);
    
}
