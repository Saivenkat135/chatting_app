package com.chat.app.repository;


import com.chat.app.entity.Conversations;
import com.chat.app.entity.FriendShips;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

public interface FriendShipRepository
        extends MongoRepository<FriendShips, String> {

    List<FriendShips> findByUser1IdAndStatus(
            String user1Id,
            String status
    );

    List<FriendShips> findByUser2IdAndStatus(
            String user2Id,
            String status
    );
}
