#!/usr/bin/env bash
set -xe
NODE_SCRIPT="${1:-start}"

KEY_PREFIX="/${ENVIRONMENT}/api-server"

echo "retrieving credentials for ${KEY_PREFIX}"

# Checks if an env var has already been set, and if not, get it from AWS Parameters Store
function getVar()
{
  # This is the string version/name/key of the env var - not the value itself.
  local env_var=$1
  local expanded=${!env_var}

  if [ -z "$expanded" ]
    then
      aws ssm get-parameters --names $KEY_PREFIX/$env_var --with-decryption --region $AWS_REGION --query "Parameters[0]"."Value" --output text
    else
      # Already set, so just returning expanded version
      echo $expanded
    fi
}

export HKGI_ENVIRONMENT_ENABLED=$(getVar "HKGI_ENVIRONMENT_ENABLED")

export LIFEBIT_MONGODB_URI_USERS=$(getVar "LIFEBIT_MONGODB_URI_USERS")
export LIFEBIT_MONGODB_URI_FILTERS=$(getVar "LIFEBIT_MONGODB_URI_FILTERS")
export LIFEBIT_MONGODB_URI_EXPORT=$(getVar "LIFEBIT_MONGODB_URI_EXPORT")
export LIFEBIT_MONGODB_URI_PARTICIPANTS=$(getVar "LIFEBIT_MONGODB_URI_PARTICIPANTS")
export LIFEBIT_MONGODB_URI_GENOMARKERS=$(getVar "LIFEBIT_MONGODB_URI_GENOMARKERS")
export LIFEBIT_MONGODB_URI_CLINICAL_PORTAL=$(getVar "LIFEBIT_MONGODB_URI_CLINICAL_PORTAL")
export JWT_SECRET=$(getVar "JWT_SECRET")

export MONGOOSE_FIELD_ENCRYPTION_ENABLED=$(getVar "MONGOOSE_FIELD_ENCRYPTION_ENABLED")
export MONGOOSE_FIELD_ENCRYPTION_SALT=$(getVar "MONGOOSE_FIELD_ENCRYPTION_SALT")
export MONGOOSE_FIELD_ENCRYPTION_SECRET=$(getVar "MONGOOSE_FIELD_ENCRYPTION_SECRET")

export ADMIN_TEAM_ID=$(getVar "ADMIN_TEAM_ID")

npm run $NODE_SCRIPT
