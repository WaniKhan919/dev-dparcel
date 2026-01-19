<?php

use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

// send email helper function
if (!function_exists('sendEmail')) {
    function sendEmail($to, $subject, $template, $data = [])
    {
        try {
            Mail::send($template, $data, function ($message) use ($to, $subject) {
                $message->to($to)
                        ->subject($subject);
            });

            return true;
        } catch (\Exception $e) {
            Log::error('Email sending failed: ' . $e->getMessage());
            return false;
        }
    }
}
// encrypt data helper function
if (!function_exists('encrypt')) {
    function encrypt($value)
    {
        try {
            return Crypt::encryptString($value);
        } catch (\Exception $e) {
            Log::error('Encryption failed: ' . $e->getMessage());
            return null;
        }
    }
}

// decrypt data helper function
if (!function_exists('decrypt')) {
    function decrypt($encrypted)
    {
        try {
            return Crypt::decryptString($encrypted);
        } catch (\Exception $e) {
            Log::error('Decryption failed: ' . $e->getMessage());
            return null;
        }
    }
}

