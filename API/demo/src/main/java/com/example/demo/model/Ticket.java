package com.example.demo.model;

import com.example.demo.model.enums.TicketCategory;
import com.example.demo.model.enums.TicketPriorityType;
import com.example.demo.model.enums.TicketStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "Tickets")
public class Ticket {

    @Id
    private String tid;

    private String description;
    
    private String contactDetails; // Mapped from Contact_Details in ER

    private TicketCategory category;

    private String adminResponse;      // Official response to the user
    private String technicianFeedback; // Technical notes from the repairer
    
    private TicketPriorityType priority;

    private TicketStatus status;

    // --- Relationships based on ER Diagram ---

    /** * The User (Lecturer/Student) who raised the ticket. 
     * ER: 'Raise' relationship (1 Lecturer/Student to M Tickets)
     */
    private String raisedByUserId;

    /** * The Technician assigned to the ticket. 
     * ER: 'Assign to' relationship (1 Technician to M Tickets)
     */
    private String assignedToTechnicianId;

    /** * The Resource associated with this ticket (e.g., broken projector). 
     * ER: 'Involves' relationship (1 Resource to M Tickets)
     */
    private String resourceId;

    // --- Audit Metadata ---

    @CreatedDate
    private Instant createdAt;

    @LastModifiedDate
    private Instant updatedAt;
}