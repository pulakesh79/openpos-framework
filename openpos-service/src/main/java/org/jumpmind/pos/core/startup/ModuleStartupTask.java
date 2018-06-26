package org.jumpmind.pos.core.startup;

import java.util.List;

import org.apache.commons.lang3.StringUtils;
import org.jumpmind.pos.service.Module;
import org.jumpmind.pos.util.BoxLogging;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

@Component
@Order(100)
public class ModuleStartupTask extends AbstractStartupTask {

    @Autowired
    ModuleRegistry moduleRegistry;

    @Override
    protected void doTask() throws Exception {
        if (moduleRegistry.getModules() != null && moduleRegistry.getModules().size() > 0) {
            List<Module> modules = moduleRegistry.getModules();
            for (Module module : modules) {
                logger.info(BoxLogging.box("Starting Module: " + StringUtils.leftPad(module.getName(), 15).toUpperCase()));
                module.start();
            }
        } else {
            logger.info(BoxLogging.box("No modules detected to start ..."));
        }
    }

}
