//Copyright 2022 Guillermo
//
//Licensed under the Apache License, Version 2.0 (the "License");
//you may not use this file except in compliance with the License.
//You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
//Unless required by applicable law or agreed to in writing, software
//distributed under the License is distributed on an "AS IS" BASIS,
//WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//See the License for the specific language governing permissions and
//limitations under the License.

const express = require('express')
const app = express()
const port = 3000
app.use(express.json())


function getAge(dateString) {
  const today = new Date();
  const birthDate = new Date(dateString);
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}


app.post('/med-information-focus', (req, res) => {
  console.log("\n\n\n--------------------------------");

  let medInformationFocus = req.body
  let gender, age, isPregnant = false
  const PREGNANT_CODE = "LA15173-0"

  const entries = medInformationFocus["IPS"]["entry"]
  let EPI = medInformationFocus["EPI"]

  entries.forEach((entry) => {
    const resource = entry["resource"]
    if (resource["resourceType"] === "Patient") {
      gender = resource["gender"]
      age = getAge(resource["birthDate"])
    }
    if (resource["resourceType"] === "Observation" && resource["valueCodeableConcept"] && resource["valueCodeableConcept"]["coding"][0]["code"] === PREGNANT_CODE) {
      isPregnant = true
    }
  });

  console.log("gender: " + gender);
  console.log("isPregnant: " + isPregnant);
  console.log("age: " + age);

  EPI["rules"] = {
    "patientMale": false,
    "patientElderWoman": false,
    "patientPregnantWoman": false
  }
  // Rule 1 
  // If (gender == male) ==> remove pregnancy section
  if (gender === "male") {
    console.log("RULE patientMale!");
    EPI["rules"]["patientMale"] = true
  }

  // Rule 2
  // If (age > 60 & gender == female) ==> remove pregnancy section
  if (age && age > 60 && gender === "female" && !isPregnant) {
    console.log("RULE patientElderWoman!");
    EPI["rules"]["patientElderWoman"] = true
  }

  // Rule 3
  // if (gender == female & pregnant)==> subpress-with-hyperlink(section-6); add-medication-pictures.
  if (gender === "female" && isPregnant) {
    console.log("RULE patientPregnantWoman!");
    EPI["rules"]["patientPregnantWoman"] = true
  }

  res.send(medInformationFocus["EPI"])
})

app.listen(port, () => {
  console.log(`Focusing module app listening on port ${port}`)
})

