import * as cdk from "@aws-cdk/core";
import * as events from "@aws-cdk/aws-events";
import * as appsync from "@aws-cdk/aws-appsync";
import * as targets from "@aws-cdk/aws-events-targets";
import * as subscriptions from "@aws-cdk/aws-sns-subscriptions";
import * as sns from "@aws-cdk/aws-sns";
import * as sqs from "@aws-cdk/aws-sqs";
import * as ddb from "@aws-cdk/aws-dynamodb";
import * as iam from "@aws-cdk/aws-iam";
import * as lambda from "@aws-cdk/aws-lambda";

export class Todo14aBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here
    const api = new appsync.GraphqlApi(this, "Api", {
      name: "todos-14a-api",
      schema: appsync.Schema.fromAsset("graphql/schema.graphql"),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.API_KEY,
          apiKeyConfig: {
            expires: cdk.Expiration.after(cdk.Duration.days(365)),
          },
        },
      },
      logConfig: { fieldLogLevel: appsync.FieldLogLevel.ALL },
      xrayEnabled: true,
    });

    // creating role for giving sns:publish access to lambda
    // const role = new iam.Role(this, "LambdaRole", {
    //   assumedBy: new iam.ServicePrincipal("lambda.amazonaws.com"),
    // });
    // const policy = new iam.PolicyStatement({
    //   effect: iam.Effect.ALLOW,
    //   actions: ["SNS:*", "logs:*", "ses:*"],
    //   resources: ["*"],
    // });
    // role.addToPolicy(policy);

    // const todosLambda = new lambda.Function(this, "AppSyncNotesHandler", {
    //   runtime: lambda.Runtime.NODEJS_12_X,
    //   handler: "main.handler",
    //   code: lambda.Code.fromAsset("functions"),
    //   memorySize: 1024,
    //   role: role,
    // });
    // const lambdaDs = api.addLambdaDataSource("lambdaDatasource", todosLambda);

   
    // HTTP DATASOURCE
    const httpDs = api.addHttpDataSource(
      "ds",
      "https://events." + this.region + ".amazonaws.com/", // This is the ENDPOINT for eventbridge.
      {
        name: "httpDsWithEventBridge",
        description: "From Appsync to Eventbridge",
        authorizationConfig: {
          signingRegion: this.region,
          signingServiceName: "events",
        },
      }
    );
    events.EventBus.grantAllPutEvents(httpDs);

    // RESOLVER
    const putEventResolver = httpDs.createResolver({
      typeName: "Mutation",
      fieldName: "addTodo",
      requestMappingTemplate: appsync.MappingTemplate.fromFile("request.vtl"),
      responseMappingTemplate: appsync.MappingTemplate.fromFile("response.vtl"),
    });

    // create an SNS topic
    const newTopic = new sns.Topic(this, "newTopic");

    // create a dead letter queue
    const dlQueue = new sqs.Queue(this, "DeadLetterQueue", {
      queueName: "MySubscription_DLQ",
      retentionPeriod: cdk.Duration.days(14),
    });

    // subscribe email to the topic
    newTopic.addSubscription(
      new subscriptions.EmailSubscription("precisework01@gmail.com", {
        json: false,
        deadLetterQueue: dlQueue,
      })
    );

    // Prints out the AppSync GraphQL endpoint to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIURL", {
      value: api.graphqlUrl,
    });

    // Prints out the AppSync GraphQL API key to the terminal
    new cdk.CfnOutput(this, "GraphQLAPIKey", {
      value: api.apiKey || "",
    });

    // Prints out the stack region to the terminal
    new cdk.CfnOutput(this, "Stack Region", {
      value: this.region,
    });

    // create a rule to publish events on SNS topic
    const rule = new events.Rule(this, "Pj14a-Rule", {
      eventPattern: {
        source: ["topicEvent"], // every event that has source = "topicEvent" will be sent to SNS topic
      },
    });

    // add the topic as a target to the rule created above
    rule.addTarget(new targets.SnsTopic(newTopic));
  }
}
