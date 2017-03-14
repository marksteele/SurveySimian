# SurveySimian

This is a quick project to demonstrate how to build a survey platform on top of a completely serverless architecture.

DISCLAIMER: Use at your own risk. This project may eat your toes in the middle of the night. Might also incur giant AWS bills if you don't pay attention to what you're doing. YOU HAVE BEEN WARNED.

The moving parts are:

* AWS Lambda
* API Gateway
* S3
* Athena
* Quicksight

For the AWS Lambda functions, we're going to leverage the serverless framework which will handle setting API Gateway endpoints and scheduled tasks.

S3 will be where the survey data is stored. We're going to try to store the data in the parquet data format, and partition it by day. We could also store the HTML forms in here as well and sit it behind CloudFront.

Finally I'll describe how to use Athena to query the survey data as well as integrating all of this into Quicksight to get visualizations of the survey data.

Before we begin, some caveats:

* Quicksight is still in preview mode and is rough around the edges. It's a far cry from a full fledged BI suite. It can't be embedded, cannot be parameterized, no dynamic dashboards, etc... Still... it's nice.
* We'll probably have to do a bit of hackery to get Athena to add paritions.
* I was originally planning on using DynamoDB. Still on the fence on this. Will have to do some analysis on minimum scaning cost in Athena...

Also, some of the benefits of this approach:

* Completely pay as you go. No fixed cost for infrastructure.
* Dynamically scales based on demand
* Should be fairly efficient even for gigantic workloads
* No servers, everything managed by AWS --> Happy ops