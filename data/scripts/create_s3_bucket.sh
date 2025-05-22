#!/bin/bash

if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
else
  echo ".env file not found. Make sure it exists before running."
  exit 1
fi

if [ -z "$S3_BUCKET" ]; then
  echo "S3_BUCKET is not set. Please set it in your .env file."
  exit 1
fi

if [ -z "$AWS_REGION" ]; then
  echo "AWS_REGION is not set. Please set it in your .env file."
  exit 1
fi

echo "Creating S3 bucket: ${S3_BUCKET} on AWS Region: ${AWS_REGION}"
echo "==================="

awslocal s3api create-bucket --bucket "${S3_BUCKET}" --acl public-read --region "${AWS_REGION}"

awslocal s3 ls --region "${AWS_REGION}"

echo "S3 Bucket created: ${S3_BUCKET}"
