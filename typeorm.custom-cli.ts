#!/usr/bin/env node
import { register } from 'ts-node';
import 'typeorm/cli';

register({ transpileOnly: true });
