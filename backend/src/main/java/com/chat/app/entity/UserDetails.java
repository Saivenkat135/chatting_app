package com.chat.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.util.List;

@Document(collection = "userData")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDetails {

    @Id
    @Field(targetType = FieldType.OBJECT_ID)
    private String userId;

    private String username;

    private String email;

    private String password;

//    private String bio;

//    private String profileImage;

    @CreatedDate
    private String createdDate;
}