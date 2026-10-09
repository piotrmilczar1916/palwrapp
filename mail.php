<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Niedozwolona metoda żądania.',
    ], JSON_UNESCAPED_UNICODE);
    exit;
}

/* --- Konfiguracja --- */
// DOKĄD trafia zapytanie — skrzynka Spolexu.
$recipient = 'biuro@spolex.com';

// OD KOGO wychodzi list. Musi być adresem w domenie serwera wysyłającego (palwrapp.pl),
// inaczej serwer odbiorcy odrzuci wiadomość lub wrzuci ją do spamu (SPF/DMARC).
// Odpowiedź klientowi i tak działa — niżej ustawiamy Reply-To na jego adres.
$fromEmail = 'formularz@palwrapp.pl';
$fromName = 'Palwrapp.pl — formularz';
$subjectPrefix = 'Palwrapp.pl — zapytanie';

function respond(int $status, bool $success, string $message, array $extra = []): void
{
    http_response_code($status);
    echo json_encode(array_merge([
        'success' => $success,
        'message' => $message,
    ], $extra), JSON_UNESCAPED_UNICODE);
    exit;
}

function field(string $key): string
{
    $value = $_POST[$key] ?? '';
    if (!is_string($value)) {
        return '';
    }

    return trim(str_replace(["\r\n", "\r"], "\n", $value));
}

function cleanLine(string $value): string
{
    return str_replace(["\r", "\n"], ' ', $value);
}

/* Pole-pułapka: wypełnia je wyłącznie bot. Odpowiadamy "sukcesem",
   żeby spamer nie dowiedział się, że wiadomość nie poszła. */
if (field('kontakt_dodatkowy') !== '') {
    respond(200, true, 'Dziękujemy — wiadomość została wysłana. Odezwiemy się wkrótce.');
}

$imie = field('imie');
$firma = field('firma');
$email = field('email');
$telefon = field('telefon');
$produkt = field('produkt');

$invalidFields = [];

if ($imie === '' || mb_strlen($imie) > 120) {
    $invalidFields[] = 'imie';
}

if ($firma === '' || mb_strlen($firma) > 160) {
    $invalidFields[] = 'firma';
}

if ($email === '' || !filter_var($email, FILTER_VALIDATE_EMAIL) || mb_strlen($email) > 160) {
    $invalidFields[] = 'email';
}

if ($telefon !== '' && mb_strlen($telefon) > 40) {
    $invalidFields[] = 'telefon';
}

if ($produkt === '' || mb_strlen($produkt) > 4000) {
    $invalidFields[] = 'produkt';
}

if ($invalidFields !== []) {
    respond(422, false, 'Uzupełnij zaznaczone pola, aby wysłać zapytanie.', [
        'fields' => $invalidFields,
    ]);
}

$subject = $subjectPrefix . ' — ' . cleanLine($firma);
$telefonDisplay = $telefon !== '' ? cleanLine($telefon) : '—';

$bodyLines = [
    'Nowe zapytanie ze strony Palwrapp.pl',
    '',
    'Imię i nazwisko: ' . cleanLine($imie),
    'Firma: ' . cleanLine($firma),
    'E-mail: ' . cleanLine($email),
    'Telefon: ' . $telefonDisplay,
    '',
    'Opis produktu do pakowania:',
    $produkt,
    '',
    '---',
    'Data: ' . date('Y-m-d H:i:s'),
    'IP: ' . ($_SERVER['REMOTE_ADDR'] ?? 'nieznane'),
    'User-Agent: ' . cleanLine($_SERVER['HTTP_USER_AGENT'] ?? 'nieznany'),
];

$body = implode("\r\n", $bodyLines);

$encodedSubject = '=?UTF-8?B?' . base64_encode($subject) . '?=';
$fromHeader = sprintf('%s <%s>', $fromName, $fromEmail);

$headers = [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . $fromHeader,
    'Reply-To: ' . $email,
    'X-Mailer: PHP/' . phpversion(),
];

// Piąty argument ustawia nadawcę koperty (Return-Path) — to jego weryfikuje SPF.
// Gdyby hosting go blokował (mail() zwraca false mimo poprawnej konfiguracji),
// wystarczy usunąć ostatni argument.
$sent = mail($recipient, $encodedSubject, $body, implode("\r\n", $headers), '-f' . $fromEmail);

if (!$sent) {
    respond(500, false, 'Nie udało się wysłać wiadomości. Spróbuj ponownie lub napisz na biuro@spolex.com.');
}

respond(200, true, 'Dziękujemy — wiadomość została wysłana. Odezwiemy się wkrótce.');
