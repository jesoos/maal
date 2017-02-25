#!/bin/bash
mysqldump -h localhost -u scott -p --databases wordlist >wordlist_$(date +%Y%m%d).sql
