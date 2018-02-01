'use strict';

const
  express = require('express'),
  bodyParser = require('body-parser'),
  slack = require('./slack'),
  slackChannels = {
    techMgmtHelp: process.env.TECH_JIRA_SERVICE_DESK_URL
  },
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 5000);

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());

app.post('/comment', function(req, res) {
  let comment = req.body.comment,
      issue = req.body.issue,
      jiraURL = issue.self.split('/rest/api')[0];

  console.log(req.body)

  let text = `${comment.author.displayName} commented on an issue`
  let attachments = [
    {
      fallback: `${comment.author.displayName} commented on <${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      title: `<${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      thumb_url: `${comment.author.avatarUrls["48x48"]}`,
      fields: [
        {
          title: "Reporter",
          value: `${issue.fields.creator.displayName}`,
          short: true
        },
        {
          title: "Comment",
          value: `${comment.body}`,
          short: false
        }
      ]
    }
  ]
  slack.sendMessage([slackChannels.techMgmtHelp], text, attachments)
})

app.post('/created', function(req, res) {
  let issue = req.body.issue,
      jiraURL = issue.self.split('/rest/api')[0];
      text = `A ${issue.fields.issuetype.name} has been created`,
      color = '#205081';
      
  let attachments = [
    {
      fallback: `${issue.fields.creator.name} created <${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      color: color, // Can either be one of 'good', 'warning', 'danger', or any hex color code
      title: `<${jiraURL}/browse/${issue.key}|${issue.key}: ${issue.fields.summary}>`,
      thumb_url: `${issue.fields.creator.avatarUrls["48x48"]}`,
      fields: [
        {
          title: "Brand",
          value: brand,
          short: true
        },
        {
          title: "Reporter",
          value: `${issue.fields.creator.displayName}`,
          short: true
        },
        {
          title: "Description",
          value: `${issue.fields.description}`,
          short: false
        }
      ]
    }
  ]

  let urls = [slackChannels.techMgmtHelp]
  slack.sendMessage(urls, text, attachments)
})

app.listen(app.get('port'), function() {
  console.log('Node app is running on port', app.get('port'));
});

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
module.exports = app;
