package com.sportbooking.module.user.repository;

import com.sportbooking.module.user.entity.Role;
import com.sportbooking.module.user.entity.RoleName;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByName(RoleName name);

    boolean existsByName(RoleName name);
}
