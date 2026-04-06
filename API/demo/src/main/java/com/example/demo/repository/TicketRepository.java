package com.example.demo.repository;

import com.example.demo.model.Ticket;
import com.example.demo.model.enums.TicketCategory;
import com.example.demo.model.enums.TicketPriorityType;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketRepository extends MongoRepository<Ticket, String> {

    /**
     * Find all tickets raised by a specific user (Student/Lecturer).
     * Corresponds to the 'Raise' relationship in the ER diagram.
     */
    List<Ticket> findByRaisedByUserId(String raisedByUserId);

    /**
     * Find all tickets assigned to a specific technician.
     * Corresponds to the 'Assign to' relationship in the ER diagram.
     */
    List<Ticket> findByAssignedToTechnicianId(String assignedToTechnicianId);

    /**
     * Find tickets related to a specific resource (e.g., a specific Lab or Device).
     * Corresponds to the 'Involves' relationship in the ER diagram.
     */
    List<Ticket> findByResourceId(String resourceId);

    /**
     * Filter tickets by category (e.g., Hardware, Software).
     */
    List<Ticket> findByCategory(TicketCategory category);

    /**
     * Find high-priority tickets that need immediate attention.
     */
    List<Ticket> findByPriority(TicketPriorityType priority);
}
