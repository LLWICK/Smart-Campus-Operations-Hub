package com.example.demo.dto;

import com.example.demo.model.enums.TicketCategory;
import com.example.demo.model.enums.TicketPriorityType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TicketRequest {

    @NotBlank(message = "Ticket description is required")
    private String description;

    @NotNull(message = "Ticket category is required")
    private TicketCategory category;

    @NotNull(message = "Ticket priority is required")
    private TicketPriorityType priority;

    private String contactDetails;

    @NotBlank(message = "User ID (Raiser) is required")
    private String raisedByUserId;

    // Optional: A ticket might not always be linked to a specific physical resource
    private String resourceId;
    
    // Optional: Can be null during creation if not yet assigned
    private String assignedToTechnicianId;
}
