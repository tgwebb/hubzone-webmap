#!/bin/bash -e

export AWS_DEFAULT_REGION=us-east-1
export SERVICE_NAME=hubzone-webmap

function usage () {
  echo "Usage: Container must be run with the following environment variables:
  DOTENV_S3_PATH: Path to the dotenv directory within S3. Ex: my-bucket/my/dir/dev/${SERVICE_NAME}/
  AWS_ENVIRONMENT: Resource environment for this service.  Used to refernce ParameterStore values.  Ex: dev, demo, qa, stg, prod, trn
  HUBZONE_MAP_DB_PASSWORD
  SECRET_KEY_BASE
  HUBZONE_GOOGLE_API_KEY
"
}

function getparameterstore () {
  ENV_NAME=$1
  PARAMETER_STORE_NAME=$2
  echo "Getting parameter ENV_NAME=${ENV_NAME}, PARAMETER_STORE_NAME=${PARAMETER_STORE_NAME}"
  echo "Testing pulling data from ParameterStore..."
  aws ssm get-parameter --name "${PARAMETER_STORE_NAME}" > /dev/null && echo "Success ${PARAMETER_STORE_NAME}" || ( echo "FATAL: Could not retrieve ParameterStore value '${PARAMETER_STORE_NAME}'"; exit 10; )
  export $ENV_NAME=$(aws ssm get-parameter --name "${PARAMETER_STORE_NAME}" | jq .Parameter.Value -r)

  if [ -z "${!ENV_NAME}" ]; then
    echo "FATAL: Could not retrieve ParameterStore value '${PARAMETER_STORE_NAME}'"
    exit 15
  else
    echo "Successfully loaded ${ENV_NAME}"
  fi
}

function get_dotenv_s3 () {
  if [ -z "${DOTENV_S3_PATH}" ] ||
     [ -z "${AWS_ENVIRONMENT}" ]; then
    echo "FATAL: Must set all environment variables before this container can be launched. Exiting."
    usage
    exit 20
  fi
  echo "Beginning sync of s3://${DOTENV_S3_PATH}..."
  aws s3 cp "s3://${DOTENV_S3_PATH}" . --recursive || ( echo "FATAL: Could not sync files from S3"; exit 30; )
  echo "Completed S3 File sync."
}

# hubzone-webmap Specific Configuration

if aws sts get-caller-identity > /dev/null 2>&1; then
  # We're using aws, pull some env vars from parameter store
  echo "Entrypoint: running in AWS"
  ## Get Parameters from Parameter Store
  getparameterstore SECRET_KEY_BASE "${AWS_ENVIRONMENT}-${SERVICE_NAME}-secret_key_base"
  getparameterstore HUBZONE_MAP_DB_PASSWORD "${AWS_ENVIRONMENT}-hubzone-db_password"
  getparameterstore HUBZONE_GOOGLE_API_KEY "${AWS_ENVIRONMENT}-hubzone-google_api_key"
else
  echo "Entrypoint: NOT running in AWS"
  if [ -z "${SECRET_KEY_BASE}" ] ||
     [ -z "${HUBZONE_MAP_DB_PASSWORD}" ] ||
     [ -z "${HUBZONE_GOOGLE_API_KEY}" ]
     then
    echo "FATAL: Must set all environment variables before this container can be launched. Exiting."
    usage
    exit 40
  fi
fi

## Not needed for hubzone-webmap
#get_dotenv_s3

exec "$@"
