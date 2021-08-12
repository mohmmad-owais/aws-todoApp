import {
  expect as expectCDK,
  matchTemplate,
  MatchStyle,
} from "@aws-cdk/assert";
import * as cdk from "@aws-cdk/core";
import * as Backend from "../lib/pj14a-backend-stack";

test("Empty Stack", () => {
  const app = new cdk.App();
  // WHEN
  const stack = new Backend.Todo14aBackendStack(app, "MyTestStack");
  // THEN
  expectCDK(stack).to(
    matchTemplate(
      {
        Resources: {},
      },
      MatchStyle.EXACT
    )
  );
});
