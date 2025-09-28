<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Attachment extends Model
{
     protected $fillable = [
        'related_id',
        'type',
        'file_path',
        'file_type',
    ];
}
