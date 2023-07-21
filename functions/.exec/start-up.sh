#Stop following command execution if command before failed
set -e

#Remove previous bucket if exists
delete_previous_version_if_exists() {
  #We either delete local folder and bucket object or just a bucket
  rm -r ./.db-dummy &&
  gsutil -m rm -r gs://mcquiz---development.appspot.com/db ||
  gsutil -m rm -r gs://mcquiz---development.appspot.com/db
}

export_production_firebase_to_emulator() {
  #Export fresh development firebase to firebase bucket
  gcloud firestore export gs://mcquiz---development.appspot.com/db

  #Create local folder
  mkdir .db-dummy

  #Copy to local folder
  gsutil -m cp -r gs://mcquiz---development.appspot.com/db ./.db-dummy
}

#Run bash functions, either delete previous bucket and local folder if exists for update or just export clean way
delete_previous_version_if_exists && export_production_firebase_to_emulator ||
export_production_firebase_to_emulator