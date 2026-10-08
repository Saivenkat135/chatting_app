package com.chat.app.services.Implementations;
import com.chat.app.DTO.LoginRequest;
import com.chat.app.DTO.UpdateProfileRequest;
import com.chat.app.DTO.userLoginResponse;
import com.chat.app.DTO.userRegResponse;
import com.chat.app.security.JwtService;
import com.chat.app.entity.UserDetails;
import com.chat.app.repository.UserRepository;
import com.chat.app.services.interfaces.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;


@Service
public class UserServiceImpl implements UserService{

    @Autowired
    UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtService jwtService;

    @Override
    public userRegResponse saveDetails(UserDetails user) {

        String encodedPassword = passwordEncoder.encode(user.getPassword());

        user.setPassword(encodedPassword);
        UserDetails response= userRepository.save(user);

        return new userRegResponse(
                "User registered successfully",
                response.getUserId()
        );

    }

    @Override
    public userLoginResponse login(LoginRequest request) {

        UserDetails user = findByEmail(request.getEmail());

        System.out.println(user.getEmail());
        System.out.println(user.getPassword());
        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPassword())) {

            throw new RuntimeException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail());

        return new userLoginResponse(token, user);
    }


    @Override
    public List<UserDetails> getAllUserDetails() {
        return userRepository.findAll();
    }

    @Override
    public UserDetails findByUsername(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(()->
                        new RuntimeException("UserName not found")
                );
    }

    public UserDetails findByEmail(String username) {
        return userRepository.findByEmail(username)
                .orElseThrow(() ->
                new RuntimeException("User not found")
        );
    }

    public void UpdateUserDetails(String email, UpdateProfileRequest request){
        UserDetails user=userRepository.findByEmail(email)
                .orElseThrow(()->
                        new RuntimeException("user not found"));

        user.setUsername(request.getUsername());
//        user.setBio(request.getBio());
//        user.setProfileImage(request.getProfileImage());

        userRepository.save(user);
    }

    @Override
    public List<UserDetails> findByUsernameContainingIgnoreCase(String username) {
        return userRepository.findByUsernameContainingIgnoreCase(username);
    }
}
