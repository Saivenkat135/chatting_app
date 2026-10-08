package com.chat.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;
import org.springframework.data.mongodb.core.mapping.FieldType;

import java.time.LocalDateTime;

@Document(collection = "friendships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FriendShips {

    @Id
    private String id; // MongoDB auto-generated ObjectId for the friendship document

    @Field(targetType = FieldType.OBJECT_ID)
    private String user1Id; // Stores reference to user 1's _id

    @Field(targetType = FieldType.OBJECT_ID)
    private String user2Id; // Stores reference to user 2's _id

    private String status; // PENDING, ACCEPTED, REJECTED, BLOCKED

    @CreatedDate
    private LocalDateTime createdAt;
}