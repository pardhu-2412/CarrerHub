package com.careerhub.platform.repository;

import com.careerhub.platform.model.Interview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface InterviewRepository extends JpaRepository<Interview, Long> {
    List<Interview> findByUserIdOrderByInterviewDateAsc(Long userId);
    List<Interview> findByUserIdAndInterviewDateAfterOrderByInterviewDateAsc(Long userId, LocalDateTime dateTime);
    List<Interview> findByInterviewDateBetweenAndReminderSentFalse(LocalDateTime start, LocalDateTime end);
    long countByUserId(Long userId);
}
