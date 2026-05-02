<?php
$recipient = 'info@hostingwebservers.com';
$successLocation = 'contact.html?sent=1';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    header('Location: ' . $successLocation, true, 302);
    exit;
}

$name = trim((string) ($_POST['name'] ?? ''));
$email = trim((string) ($_POST['email'] ?? ''));
$subject = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $subject === '' || $message === '') {
    http_response_code(400);
    echo 'All fields are required.';
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo 'Please provide a valid email address.';
    exit;
}

$cleanName = preg_replace('/[\r\n]+/', ' ', $name);
$cleanEmail = preg_replace('/[\r\n]+/', ' ', $email);
$cleanSubject = preg_replace('/[\r\n]+/', ' ', $subject);

$emailSubject = '[' . 'HostingWebservers.com' . '] ' . $cleanSubject;
$emailBody = "New contact form submission:\r\n\r\n";
$emailBody .= "Name: {$cleanName}\r\n";
$emailBody .= "Email: {$cleanEmail}\r\n";
$emailBody .= "Subject: {$cleanSubject}\r\n\r\n";
$emailBody .= "Message:\r\n{$message}\r\n";

$headers = [];
$headers[] = 'MIME-Version: 1.0';
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'From: HostingWebservers.com <no-reply@hostingwebservers.com>';
$headers[] = 'Reply-To: ' . $cleanName . ' <' . $cleanEmail . '>';

$sent = mail($recipient, $emailSubject, $emailBody, implode("\r\n", $headers));

if ($sent) {
    header('Location: ' . $successLocation, true, 302);
    exit;
}

http_response_code(500);
echo 'The message could not be sent at this time. Please try again later.';
