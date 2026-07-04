<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class GenericMail extends Mailable implements ShouldQueue
{
    use Queueable, SerializesModels;

    public function __construct(
        private string $template,
        private array  $templateData,
        private string $mailSubject
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: $this->mailSubject);
    }

    public function content(): Content
    {
        return new Content(
            view: $this->template,
            with: $this->templateData,
        );
    }

    public function attachments(): array
    {
        return [];
    }
}
