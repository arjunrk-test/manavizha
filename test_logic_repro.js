async function testLogic() {
  const dateTime = "2000-11-26T08:31:00";
  const timezone = "+05:30";
  
  const fullString = dateTime.includes('+') || dateTime.includes('Z') 
          ? dateTime 
          : `${dateTime}${timezone}`;
  
  console.log("Constructed string:", fullString);
  const date = new Date(fullString);
  console.log("Parsed Date:", date.toString());
  console.log("Is NaN:", isNaN(date.getTime()));
  console.log("ISO:", date.toISOString());
}

testLogic();
