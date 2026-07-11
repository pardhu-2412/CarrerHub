package com.careerhub.platform.repository;

import com.careerhub.platform.model.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    List<Job> findByIsActiveTrueOrderByPostedAtDesc();

    @Query("SELECT j FROM Job j WHERE j.isActive = true AND " +
           "(LOWER(j.title) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(j.companyName) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(j.location) LIKE LOWER(CONCAT('%', :query, '%')) OR " +
           " LOWER(j.description) LIKE LOWER(CONCAT('%', :query, '%'))) " +
           "ORDER BY j.postedAt DESC")
    List<Job> searchJobs(String query);
}
