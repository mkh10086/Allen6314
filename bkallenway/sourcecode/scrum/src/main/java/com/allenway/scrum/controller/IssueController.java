package com.allenway.scrum.controller;

import com.allenway.infrustructure.exception.DataNotFoundException;
import com.allenway.scrum.entity.Issue;
import com.allenway.scrum.entity.Item;
import com.allenway.scrum.service.IssueService;
import com.allenway.scrum.service.ItemService;
import com.allenway.utils.response.ReturnStatusCode;
import com.allenway.utils.response.ReturnTemplate;
import com.allenway.utils.validparam.ValidUtils;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * Created by wuhuachuan on 16/7/1.
 */

@RestController
@Slf4j
public class IssueController {

    @Autowired
    public IssueService issueService;

    @Autowired
    private ItemService itemService;

    @RequestMapping(value = "/issue/add-issue",method = RequestMethod.POST)
    public Object addIssue(Issue issue){
        if(validAddIssueParam(issue)){
            ReturnTemplate returnTemplate = new ReturnTemplate();
            returnTemplate.addData("issue",issueService.save(issue));
            return returnTemplate;
        } else {
            throw new IllegalArgumentException("issue's name is invalid");
        }
    }

    private boolean validAddIssueParam(Issue issue) {
        String name = issue.getName();
        if(StringUtils.isEmpty(name) || name.length() > 20){
            return false;
        } else {
            return true;
        }
    }

    @RequestMapping(value = "/issue/find-all-issues",method = RequestMethod.GET)
    public Object findAllIssues(String userid){

        log.info("findAllissues function ... userid = {}.",userid);

        if(ValidUtils.validIdParam(userid)){
            ReturnTemplate returnTemplate = new ReturnTemplate();
            returnTemplate.addData("issues",issueService.findAllIssuesByUserId(userid));
            return returnTemplate;
        } else {
            throw new IllegalArgumentException("id is invalid");
        }
    }

    @RequestMapping(value = "/issue/delete-issue-by-id",method = RequestMethod.POST)
    public Object deleteItemById(String issueId){

        log.info("issueId = {}",issueId);

        if(ValidUtils.validIdParam(issueId)){
            Issue issue = issueService.findIssueById(issueId);
            if(issue == null){
                throw new DataNotFoundException("issue isn't found by issueId");
            } else {
                ReturnTemplate returnTemplate = new ReturnTemplate();

                int num = itemService.itemNum(issueId);
                log.info("num = {}.",num);

                if(num == 0){
                    issue.setIsDelete("1");
                    issueService.save(issue);
                    return returnTemplate;
                } else {
                    returnTemplate.setStatusCode(ReturnStatusCode.ISSUEHASITEMS);
                    return returnTemplate;
                }
            }
        } else {
            throw new IllegalArgumentException("itemId is invalid");
        }
    }
}
