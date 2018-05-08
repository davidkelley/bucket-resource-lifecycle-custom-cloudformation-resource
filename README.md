# Bucket Resource Lifecycle Custom Resource

Ever been confronted by the inability for CloudFormation to delete S3 buckets that aren't empty?

This simple project provides a Custom CloudFormation resource, which empties the bucket, before CloudFormation attempts to delete it, either through a `DependsOn` attribute, or via an implicit dependency link by using `!Ref BucketName` in the `BucketName` property assignment.

Whenever the **resource is deleted** or the **CloudFormation stack is deleted**, it will empty the source bucket. If, for example you wish to avoid the deletion of items, you can update the `Enabled` property to `false`.

In-order to avoid enabling the function to delete _any file_ from _any bucket_, you must also provide a `RoleArn` that has sufficient privileges, which the function has permissions to assume in-order to empty the bucket (demonstrated below).

An example CloudFormation snippet, for granting the Delete function permissions to your source bucket:

```yaml
SourceBucket:
  Type: AWS::S3::Bucket

SourceBucketDeleteLifecycle:
  Type: Custom::DeleteObjects
  Properties:
    Enabled: true
    ServiceToken: !ImportValue DeleteObjectsFunctionArn
    BucketName: !Ref SourceBucket
    RoleArn: !GetAtt DeleteObjectsFunctionRole.Arn

DeleteObjectsFunctionRole:
  Type: AWS::IAM::Role
  Properties:
    Path: '/'
    AssumeRolePolicyDocument:
      Version: "2012-10-17"
      Statement:
        - Effect: Allow
          Principal:
            AWS: !ImportValue DeleteObjectsFunctionArn
          Condition:
            StringEquals:
              sts:ExternalId: !ImportValue DeleteObjectsFunction
          Action: sts:AssumeRole
    Policies:
      - PolicyName: EmptyBucketPermissions
        PolicyDocument:
          Version: 2012-10-17
          Statement:
            - Effect: Allow
              Action:
                - s3:DeleteObject
                - s3:ListBucket
              Resource:
                - !GetAtt SourceBucket.Arn
                - !Sub "${SourceBucket.Arn}/*"
```
