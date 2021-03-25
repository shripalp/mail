document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => {
    get_emails('inbox'); 
  });
  document.querySelector('#sent').addEventListener('click', () => {
    get_emails('sent'); 
  });
  document.querySelector('#archived').addEventListener('click', () => {
    get_emails('archive'); 
  });
  document.querySelector('#compose').addEventListener('click', compose_email);

  //send email when press submit on compose email form
  document.querySelector('#compose-form').onsubmit = send_email;
  
  
  // By default, load the inbox
  get_emails('inbox');
  
});



function send_email() {

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;
  
    //API call to post data
    fetch('/emails', {
      method:'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
      })
    })
   //load_mailbox('sent');
    .then ( ()=> {
      get_emails('sent');
    });
    
  
    return false;
}


function get_email(email_id) {
  //GET individual email
  fetch(`/emails/${email_id}`)
  .then(response => response.json())
  .then(email => {
    // read email and set read flag to true
    read_flag(email_id); read_email(email); 
  });

}


function read_email(email) {
  //read individual email that was clicked/selected from inbox, sent, and archive mailbox

  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display ='none';
  document.querySelector('#read_email').style.display = 'block';
  document.querySelector('#read_email').innerHTML= "";

  const email_id = parseInt(email["id"]);
  const e1 = document.createElement("div");
  e1.setAttribute("id", "from");
  const e2 = document.createElement("div");
  e2.setAttribute("id", "to");
  const e3 = document.createElement("div");
  e3.setAttribute("id", "subject");
  const e4 = document.createElement("div");
  e4.setAttribute("id", "timestamp");
  const e5 = document.createElement("div");
  e5.setAttribute("id", "body");

  

 
  e1.innerHTML=`From: ${email["sender"]}`;
  e2.innerHTML=`To: ${email["recipients"]}`;
  e3.innerHTML=`Subject: ${email["subject"]}`;
  e4.innerHTML=email["timestamp"];
  e5.innerHTML=email["body"];
  


  document.querySelector("#read_email").append(e1);
  document.querySelector("#read_email").append(e2);
  document.querySelector("#read_email").append(e3);
  document.querySelector("#read_email").append(e4);

  

  
  var recipient_emails = email['recipients']
  recipient_emails.forEach(check)
  //if user also sent mail to self
  function check () {
    if (recipient_emails != email['user']) {
      recipient_emails.pop()
    }
  }
 
  //only offer reply and archive option for emails from inbox mailbox and not from sent mailbox
  //also offer unarchive option if email is opened from archive mailbox
  //also offer archive option for email sent to self among multiple users
  if((email["user"]!==email["sender"]) || (email['user'] == recipient_emails)) {
    if (email["archived"]) {
      const b2 = document.createElement("button");
      b2.setAttribute("class", "btn btn-sm btn-outline-primary");
      b2.innerHTML= "Unarchive";
      b2.setAttribute("id", "unarchive");
      document.querySelector("#read_email").append(b2);
      document.querySelector('#unarchive').addEventListener('click', function() {
        unarchive_flag(email_id); });

    } else {
      const b1 = document.createElement("button");
      b1.setAttribute("class", "btn btn-sm btn-outline-primary");
      b1.setAttribute("id", "reply");
      b1.innerHTML = "Reply";
      
      const b2 = document.createElement("button");
      b2.setAttribute("class", "btn btn-sm btn-outline-primary");
      b2.innerHTML= "Archive";
      b2.setAttribute("id", "archive");
      document.querySelector("#read_email").append(b1);
      document.querySelector("#read_email").append(b2);
      //if archive selected, set archive to true, and then load inbox mailbox

      
      document.querySelector('#archive').addEventListener('click', function() {
        archive_flag(email_id); });
      //if reply selected, offer compose email form with prefilled forms
      document.querySelector('#reply').addEventListener('click', function() {
        prefill_form(email); });
      
    }
  }
  document.querySelector("#read_email").append(e5);
  
}

//set read to true if email opened
function read_flag(email_id) {
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  });
  
}

//set archive to true and archive the email if archive selected
function archive_flag(email_id) {
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
        archived: true
    })
  })
  //load inbox after archive
  .then ( ()=> {
    get_emails('inbox');
  });

}

//set archive to false and unarchive the email
function unarchive_flag(email_id) {
  fetch(`/emails/${email_id}`,{
    method: 'PUT',
    body: JSON.stringify({
        archived: false
    })
  })
  //load inbox after unarchive
  .then ( ()=> {
    get_emails('inbox');
  });

}


//display email for inbox and archive and sent  mailbox
function print_emails(email, mailbox) {

  const subject = email["subject"];
  const sender = email["sender"];
  const date = email["timestamp"];
  const recipients = email["recipients"];

  const email_id = parseInt(email["id"]);
  
  const a1 = document.createElement("div");
  a1.setAttribute("class", "sender");
  const a2 = document.createElement("div");
  a2.setAttribute("class", "subject");
  const a3 = document.createElement("div");
  a3.setAttribute("class", "date");

  const di = document.createElement("div");
  di.setAttribute("id", "all_emails");

  document.querySelector("#emails-view").append(di);
  //display recipients if selected mailbox is sent, otherwise display sender
  if(mailbox==="sent") {
    a1.innerHTML=recipients;
  } else {
    a1.innerHTML=sender;
  }
  a2.innerHTML=subject;
  a3.innerHTML=date;

  document.querySelector("#all_emails").append(a1);
  document.querySelector("#all_emails").append(a2);
  document.querySelector("#all_emails").append(a3);

  //distguish between read and unread emails
  if(email["read"]) {
      di.setAttribute("id", "email_read");
    } else {
      di.setAttribute("id", "email_unread");
    }
    di.addEventListener('click', function() {
      get_email(email_id);
    });
    
  
}

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';
  document.querySelector('#read_email').style.display = 'none';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
  
}

function prefill_form(email) {

   // Show compose view and hide other views
   document.querySelector('#emails-view').style.display = 'none';
   document.querySelector('#compose-view').style.display = 'block';
   document.querySelector('#read_email').style.display = 'none';

  //prefeill To: field with sender email
  document.querySelector('#compose-recipients').value = email["sender"];
  // prefill subject line remove Re: from subject line if already present
  const str = email["subject"];
  const sub = str.replace("Re:", "");
  document.querySelector('#compose-subject').value = `Re: ${sub}`;

  //prefill reply body with sender and timestamp information 
  document.querySelector('#compose-body').value = `\n On ${email["timestamp"]} ${email["sender"]} wrote: \n${email["body"]} `;
  document.querySelector('#message').innerHTML = `Reply`;  

}


function get_emails(mailbox) {

   // Show the mailbox and hide other views
   document.querySelector('#emails-view').style.display = 'block';
   document.querySelector('#compose-view').style.display = 'none';
   document.querySelector('#read_email').style.display = 'none';
 
 
   // Show the mailbox name, first letter to uppercase
   document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

   //GET api call to load sent mailbox
   fetch(`/emails/${mailbox}`)
   //read the response as json
   .then(function(response) { 
     return response.json();
   })
   //read each email and print it inside of selected mailbox in its own div
   .then(emails => {
     emails.forEach(function(email) {
       print_emails(email, mailbox);
     });
   });

}




