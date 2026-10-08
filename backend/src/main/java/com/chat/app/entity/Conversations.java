package com.chat.app.entity;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class Conversations {

    @Id
    private String id;

    private String type;
    private List<String> participants;

    @CreatedDate
    private String createdAt;

    private String lastMessage;

    private String lastMessageAt;

}
