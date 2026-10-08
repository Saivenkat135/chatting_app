package com.chat.app.repository;

import com.chat.app.entity.UserDetails;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;
import java.util.Optional;


public interface UserRepository extends MongoRepository<UserDetails,String> {
    Optional<UserDetails> findByUsername(String username);
    Optional<UserDetails> findByEmail(String email);
    List<UserDetails> findByUsernameContainingIgnoreCase(String username);
}
