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
  
  // Rule 1 
  // If (gender == male) ==> remove pregnancy section
  if (gender === "male") {
    console.log("RULE 1!");
  }
  
  // Rule 2
  // If (age > 60 & gender == female) ==> remove pregnancy section
  if (age && age > 60 && gender === "female" && !isPregnant) {
    console.log("RULE 2!");
  }
  
  // Rule 3
  // if (gender == female & pregnant)==> subpress-with-hyperlink(section-6); add-medication-pictures.
  if (gender === "female" && isPregnant) {
    console.log("RULE 3!");
  }
  res.send(medInformationFocus["EPI"])
})

app.listen(port, () => {
  console.log(`Focusing module app listening on port ${port}`)
})

