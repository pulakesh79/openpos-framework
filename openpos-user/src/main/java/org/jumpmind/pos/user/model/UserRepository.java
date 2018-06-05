package org.jumpmind.pos.user.model;

import java.util.List;

import org.jumpmind.pos.persist.DBSession;
import org.jumpmind.pos.persist.Query;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.DependsOn;
import org.springframework.context.annotation.Lazy;
import org.springframework.stereotype.Repository;
import org.jumpmind.pos.user.model.User;
import org.jumpmind.pos.user.model.Permission;
import org.jumpmind.pos.user.model.Workgroup;

@Repository
@DependsOn(value = { "UserModule" })
public class UserRepository {

    private Query<PasswordHistory> passwordHistoryLookup = new Query<PasswordHistory>().named("passwordHistoryLookup")
            .result(PasswordHistory.class);
    
    private Query<Permission> workgroupPermissionsLookup = new Query<Permission>().named("workgroupPermissionsLookup")
    		.result(Permission.class);
    
    @Autowired
    @Lazy
    private DBSession userSession;

    public User findUser(String userName) {
        User userLookedUp = userSession.findByNaturalId(User.class, userName);
        if (userLookedUp != null) {
            List<PasswordHistory> passwordHistory = userSession.query(passwordHistoryLookup, userLookedUp.getUsername());
            if (passwordHistory != null) {
                userLookedUp.setPasswordHistory(passwordHistory);
            }
        }

        if (userLookedUp != null) {
            String workgroupId = userLookedUp.getWorkgroupId();
            if (workgroupId != null) {
                Workgroup workgroup = userSession.findByNaturalId(Workgroup.class, workgroupId);
                List<Permission> permissions = userSession.query(workgroupPermissionsLookup, workgroupId);
                if (workgroup != null) {
                    if (permissions != null) {
                        workgroup.setPermissions(permissions);
                    }
                    userLookedUp.setWorkgroup(workgroup);
                }
            }
        }
        return userLookedUp;
    }

    public void save(User user) {
        userSession.save(user);

        for (PasswordHistory passwordHistory : user.getPasswordHistory()) {
            passwordHistory.setUsername(user.getUsername());
        }

        userSession.saveAll(user.getPasswordHistory());
    }
}