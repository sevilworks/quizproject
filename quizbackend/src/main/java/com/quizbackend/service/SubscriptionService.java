package com.quizbackend.service;

import com.quizbackend.entity.Subscription;
import com.quizbackend.repository.SubscriptionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class SubscriptionService {

    @Autowired
    private SubscriptionRepository subscriptionRepository;

    public Subscription createSubscription(String name, java.math.BigDecimal price, Integer durationDays) {
        Subscription subscription = new Subscription();
        subscription.setName(name);
        subscription.setPrice(price);
        subscription.setDurationDays(durationDays);
        return subscriptionRepository.save(subscription);
    }

    public Subscription getSubscriptionById(Integer id) {
        return subscriptionRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Subscription not found"));
    }

    public List<Subscription> getAllSubscriptions() {
        return subscriptionRepository.findAll();
    }

    public Subscription updateSubscription(Integer id, String name, java.math.BigDecimal price, Integer durationDays) {
        Subscription subscription = getSubscriptionById(id);
        subscription.setName(name);
        subscription.setPrice(price);
        subscription.setDurationDays(durationDays);
        return subscriptionRepository.save(subscription);
    }

    public void deleteSubscription(Integer id) {
        Subscription subscription = getSubscriptionById(id);
        subscriptionRepository.delete(subscription);
    }
}
