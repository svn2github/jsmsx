/* JSMSX - MSX Emulator in Javascript
 * Copyright (c) 2006 Marcus Granado <mrc.gran(@)gmail.com>
 *
 * Portions of the initial code was inspired by the work of
 * Arnon Cardoso's Java MSX Emulator and
 * Adam Davidson & Andrew Pollard's Z80 class of the Spectrum Java Emulator
 * after reading this thread: http://www.msx.org/forumtopic4176.html
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * version 2 as published by the Free Software Foundation.
 * The full license is available at http://www.gnu.org/licenses/gpl.html
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 */

function Z80(d)
{
    this.steps = 0; //steps since reset
    this.showpc = false; //show _PC red pixel


    this.tstatesPerInterrupt = 0;
    this.IM0 = 0;
    this.IM1 = 1;
    this.IM2 = 2;
    this.F_C = 1;
    this.F_N = 2;
    this.F_PV = 4;
    this.F_3 = 8;
    this.F_H = 16;
    this.F_5 = 32;
    this.F_Z = 64;
    this.F_S = 128;
    this.PF = 4;
    this.p_ = 0;
    this.parity = new Array(256);
    this._A = 0;
    this._HL = 0;
    this._B = 0;
    this._C = 0;
    this._DE = 0;
    this.fS = false;
    this.fZ = false;
    this.f5 = false;
    this.fH = false;
    this.f3 = false;
    this.fPV = false;
    this.fN = false;
    this.fC = false;
    this._AF_ = 0;
    this._HL_ = 0;
    this._BC_ = 0;
    this._DE_ = 0;
    this._IX = 0;
    this._IY = 0;
    this._ID = 0;
    this._SP = 0;
    this._PC = 0;
    this._I = 0;
    this._R = 0;
    this._R7 = 0;
    this._IFF1 = true;
    this._IFF2 = true;
    this._IM = 2;
    
    //static 
    {
	for (var i = 0; i < 256; i++) {
	    bool = true;
	    for (var i_0_ = 0; i_0_ < 8; i_0_++) {
		if ((i & 1 << i_0_) != 0)
		    bool ^= true;
	    }
	    this.parity[i] = bool;
	}
    }
    
    //public Z80(double d) {
	this.tstatesPerInterrupt = (d * 1000000.0 / 60.0);
    //}

    this.byte = function(i) { //returns i between -128 to +127
	return ((i & 0x80) != 0) ? i - 256: i;
    }
    
    this.A = function() {
	return this._A;
    }
    
    this.AF = function() {
	return this.A() << 8 | this.F();
    }
    
    this.B = function() {
	return this._B;
    }
    
    this.BC = function() {
	return this.B() << 8 | this.C();
    }
    
    this.C = function() {
	return this._C;
    }
    
    this.Cset = function() {
	return this.fC;
    }
    
    this.D = function() {
	return this._DE >> 8;
    }
    
    this.DE = function() {
	return this._DE;
    }
    
    this.E = function() {
	return this._DE & 0xff;
    }
    
    this.F = function() {
	return ((this.Sset() ? 128 : 0) | (this.Zset() ? 64 : 0) | (this.f5 ? 32 : 0)
		| (this.Hset() ? 16 : 0) | (this.f3 ? 8 : 0) | (this.PVset() ? 4 : 0)
		| (this.Nset() ? 2 : 0) | (this.Cset() ? 1 : 0));
    }
    
    this.H = function() {
	return this._HL >> 8;
    }
    
    this.HL = function() {
	return this._HL;
    }
    
    this.Hset = function() {
	return this.fH;
    }
    
    this.I = function() {
	return this._I;
    }
    
    this.ID = function() {
	return this._ID;
    }
    
    this.IDH = function() {
	return this._ID >> 8;
    }
    
    this.IDL = function() {
	return this._ID & 0xff;
    }
    
    this.ID_d = function() {
	return this.ID() + this.byte(this.nxtpcb()) & 0xffff;
    }
    
    this.IFF1 = function() {
	return this._IFF1;
    }
    
    this.IFF2 = function() {
	return this._IFF2;
    }
    
    this.IM = function() {
	return this._IM;
    }
    
    this.IX = function() {
	return this._IX;
    }
    
    this.IY = function() {
	return this._IY;
    }
    
    this.L = function() {
	return this._HL & 0xff;
    }
    
    this.Nset = function() {
	return this.fN;
    }
    
    this.PC = function() {
	return this._PC;
    }
    
    this.PVset = function() {
	return this.fPV;
    }
    
    this.R = function() {
	return this._R & 0x7f | this._R7;
    }
    
    this.R7 = function() {
	return this._R7;
    }
    
    this.REFRESH = function(i) {
	this._R += i;
    }
    
    this.SP = function() {
	return this._SP;
    }
    
    this.Sset = function() {
	return this.fS;
    }
    
    this.Zset = function() {
	return this.fZ;
    }
    
    this.adc16 = function(i, i_1_) {
	var i_2_ = this.Cset() ? 1 : 0;
	var i_3_ = i + i_1_ + i_2_;
	var i_4_ = i_3_ & 0xffff;
	this.setS((i_4_ & 0x8000) != 0);
	this.set3((i_4_ & 0x800) != 0);
	this.set5((i_4_ & 0x2000) != 0);
	this.setZ(i_4_ == 0);
	this.setC((i_3_ & 0x10000) != 0);
	this.setPV(((i ^ (i_1_ ^ 0xffffffff)) & (i ^ i_4_) & 0x8000) != 0);
	this.setH(((i & 0xfff) + (i_1_ & 0xfff) + i_2_ & 0x1000) != 0);
	this.setN(false);
	return i_4_;
    }
    
    this.adc_a = function(i) {
	var i_5_ = this.A();
	var i_6_ = this.Cset() ? 1 : 0;
	var i_7_ = i_5_ + i + i_6_;
	var i_8_ = i_7_ & 0xff;
	this.setS((i_8_ & 0x80) != 0);
	this.set3((i_8_ & 0x8) != 0);
	this.set5((i_8_ & 0x20) != 0);
	this.setZ(i_8_ == 0);
	this.setC((i_7_ & 0x100) != 0);
	this.setPV(((i_5_ ^ (i ^ 0xffffffff)) & (i_5_ ^ i_8_) & 0x80) != 0);
	this.setH(((i_5_ & 0xf) + (i & 0xf) + i_6_ & 0x10) != 0);
	this.setN(false);
	this.mudaA(i_8_);
    }
    
    this.add16 = function(i, i_9_) {
	var i_10_ = i + i_9_;
	var i_11_ = i_10_ & 0xffff;
	this.set3((i_11_ & 0x800) != 0);
	this.set5((i_11_ & 0x2000) != 0);
	this.setC((i_10_ & 0x10000) != 0);
	this.setH(((i & 0xfff) + (i_9_ & 0xfff) & 0x1000) != 0);
	this.setN(false);
	return i_11_;
    }
    
    this.add_a = function(i) {
	var i_12_ = this.A();
	var i_13_ = i_12_ + i;
	var i_14_ = i_13_ & 0xff;
	this.setS((i_14_ & 0x80) != 0);
	this.set3((i_14_ & 0x8) != 0);
	this.set5((i_14_ & 0x20) != 0);
	this.setZ(i_14_ == 0);
	this.setC((i_13_ & 0x100) != 0);
	this.setPV(((i_12_ ^ (i ^ 0xffffffff)) & (i_12_ ^ i_14_) & 0x80) != 0);
	this.setH(((i_12_ & 0xf) + (i & 0xf) & 0x10) != 0);
	this.setN(false);
	this.mudaA(i_14_);
    }
    
    this.and_a = function(i) {
	var i_15_ = this.A() & i;
	this.setS((i_15_ & 0x80) != 0);
	this.set3((i_15_ & 0x8) != 0);
	this.set5((i_15_ & 0x20) != 0);
	this.setH(true);
	this.setPV(this.parity[i_15_ & 0xff]);
	this.setZ(i_15_ == 0);
	this.setN(false);
	this.setC(false);
	this.mudaA(i_15_);
    }
    
    this.bit = function(i, i_16_) {
	var bool = (i_16_ & i) != 0;
	this.setN(false);
	this.setH(true);
	this.set3((i_16_ & 0x8) != 0);
	this.set5((i_16_ & 0x20) != 0);
	this.setS(i == 128 ? bool : false);
	this.setZ(bool ^ true);
	this.setPV(bool ^ true);
    }
    
    this.ccf = function() {
	var i = this.A();
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setN(false);
	this.setC(!this.Cset());
    }
    
    this.cp_a = function(i) {
	var i_17_ = this.A();
	var i_18_ = i_17_ - i;
	var i_19_ = i_18_ & 0xff;
	this.setS((i_19_ & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setN(true);
	this.setZ(i_19_ == 0);
	this.setC((i_18_ & 0x100) != 0);
	this.setH(((i_17_ & 0xf) - (i & 0xf) & 0x10) != 0);
	this.setPV(((i_17_ ^ i) & (i_17_ ^ i_19_) & 0x80) != 0);
    }
    
    this.cpl_a = function() {
	var i = this.A() ^ 0xff;
	this.set3((this.A() & 0x8) != 0);
	this.set5((this.A() & 0x20) != 0);
	this.setH(true);
	this.setN(true);
	this.mudaA(i);
    }
    
    this.daa_a = function() {
	var i = this.A();
	var i_20_ = 0;
	bool = this.Cset();
	if (this.Hset() || (i & 0xf) > 9)
	    i_20_ |= 0x6;
	if (bool || i > 159 || i > 143 && (i & 0xf) > 9)
	    i_20_ |= 0x60;
	if (i > 153)
	    bool = true;
	if (this.Nset())
	    this.sub_a(i_20_);
	else
	    this.add_a(i_20_);
	i = this.A();
	this.setC(bool);
	this.setPV(this.parity[i]);
    }
    
    this.dec16 = function(i) {
	return i - 1 & 0xffff;
    }
    
    this.dec8 = function(i) {
	var bool = i == 128;
	var bool_21_ = ((i & 0xf) - 1 & 0x10) != 0;
	i = i - 1 & 0xff;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(bool);
	this.setH(bool_21_);
	this.setN(true);
	return i;
    }
    
    this.ex_af_af = function() {
	var i = this.AF();
	this.mudaAF(this._AF_);
	this._AF_ = i;
    }
    
    this.execute = function() {
	//var i = -this.tstatesPerInterrupt;
        //var ticks=1000;
	//var pcs = '';

	var i = -(this.tstatesPerInterrupt - this.interrupt());

	while (i < 0) {
	    this.REFRESH(1);
	    var i_22_ = this.nxtpcb();
	    //if (this.showpc) 
		this.vdp.imagedata.data[this._PC*4]+=247;

	    switch (i_22_) {
	    default:
		break;
	    case 0:
		i += 4;
		break;
	    case 8:
		this.ex_af_af();
		i += 4;
		break;
	    case 16: {
		var i_23_ = 0;
		this.mudaB(i_23_ = this.qdec8(this.B()));
		if (i_23_ != 0) {
		    var i_24_ = this.byte(this.nxtpcb());
		    this.mudaPC(this.PC() + i_24_ & 0xffff);
		    i += 13;
		} else {
		    this.mudaPC(this.inc16(this.PC()));
		    i += 8;
		}
		break;
	    }
	    case 24: {
		var i_25_ = this.byte(this.nxtpcb());
		this.mudaPC(this.PC() + i_25_ & 0xffff);
		i += 12;
		break;
	    }
	    case 32:
		if (!this.Zset()) {
		    var i_26_ = this.byte(this.nxtpcb());
		    this.mudaPC(this.PC() + i_26_ & 0xffff);
		    i += 12;
		} else {
		    this.mudaPC(this.inc16(this.PC()));
		    i += 7;
		}
		break;
	    case 40:
		if (this.Zset()) {
		    var i_27_ = this.byte(this.nxtpcb());
		    this.mudaPC(this.PC() + i_27_ & 0xffff);
		    i += 12;
		} else {
		    this.mudaPC(this.inc16(this.PC()));
		    i += 7;
		}
		break;
	    case 48:
		if (!this.Cset()) {
		    var i_28_ = this.byte(this.nxtpcb());
		    this.mudaPC(this.PC() + i_28_ & 0xffff);
		    i += 12;
		} else {
		    this.mudaPC(this.inc16(this.PC()));
		    i += 7;
		}
		break;
	    case 56:
		if (this.Cset()) {
		    var i_29_ = this.byte(this.nxtpcb());
		    this.mudaPC(this.PC() + i_29_ & 0xffff);
		    i += 12;
		} else {
		    this.mudaPC(this.inc16(this.PC()));
		    i += 7;
		}
		break;
	    case 1:
		this.mudaBC(this.nxtpcw());
		i += 10;
		break;
	    case 9:
		this.mudaHL(this.add16(this.HL(), this.BC()));
		i += 11;
		break;
	    case 17:
		this.mudaDE(this.nxtpcw());
		i += 10;
		break;
	    case 25:
		this.mudaHL(this.add16(this.HL(), this.DE()));
		i += 11;
		break;
	    case 33:
		this.mudaHL(this.nxtpcw());
		i += 10;
		break;
	    case 41: {
		var i_30_ = this.HL();
		this.mudaHL(this.add16(i_30_, i_30_));
		i += 11;
		break;
	    }
	    case 49:
		this.mudaSP(this.nxtpcw());
		i += 10;
		break;
	    case 57:
		this.mudaHL(this.add16(this.HL(), this.SP()));
		i += 11;
		break;
	    case 2:
		this.pokeb(this.BC(), this.A());
		i += 7;
		break;
	    case 10:
		this.mudaA(this.peekb(this.BC()));
		i += 7;
		break;
	    case 18:
		this.pokeb(this.DE(), this.A());
		i += 7;
		break;
	    case 26:
		this.mudaA(this.peekb(this.DE()));
		i += 7;
		break;
	    case 34:
		this.pokew(this.nxtpcw(), this.HL());
		i += 16;
		break;
	    case 42:
		this.mudaHL(this.peekw(this.nxtpcw()));
		i += 16;
		break;
	    case 50:
		this.pokeb(this.nxtpcw(), this.A());
		i += 13;
		break;
	    case 58:
		this.mudaA(this.peekb(this.nxtpcw()));
		i += 13;
		break;
	    case 3:
		this.mudaBC(this.inc16(this.BC()));
		i += 6;
		break;
	    case 11:
		this.mudaBC(this.dec16(this.BC()));
		i += 6;
		break;
	    case 19:
		this.mudaDE(this.inc16(this.DE()));
		i += 6;
		break;
	    case 27:
		this.mudaDE(this.dec16(this.DE()));
		i += 6;
		break;
	    case 35:
		this.mudaHL(this.inc16(this.HL()));
		i += 6;
		break;
	    case 43:
		this.mudaHL(this.dec16(this.HL()));
		i += 6;
		break;
	    case 51:
		this.mudaSP(this.inc16(this.SP()));
		i += 6;
		break;
	    case 59:
		this.mudaSP(this.dec16(this.SP()));
		i += 6;
		break;
	    case 4:
		this.mudaB(this.inc8(this.B()));
		i += 4;
		break;
	    case 12:
		this.mudaC(this.inc8(this.C()));
		i += 4;
		break;
	    case 20:
		this.mudaD(this.inc8(this.D()));
		i += 4;
		break;
	    case 28:
		this.mudaE(this.inc8(this.E()));
		i += 4;
		break;
	    case 36:
		this.mudaH(this.inc8(this.H()));
		i += 4;
		break;
	    case 44:
		this.mudaL(this.inc8(this.L()));
		i += 4;
		break;
	    case 52: {
		var i_31_ = this.HL();
		this.pokeb(i_31_, this.inc8(this.peekb(i_31_)));
		i += 11;
		break;
	    }
	    case 60:
		this.mudaA(this.inc8(this.A()));
		i += 4;
		break;
	    case 5:
		this.mudaB(this.dec8(this.B()));
		i += 4;
		break;
	    case 13:
		this.mudaC(this.dec8(this.C()));
		i += 4;
		break;
	    case 21:
		this.mudaD(this.dec8(this.D()));
		i += 4;
		break;
	    case 29:
		this.mudaE(this.dec8(this.E()));
		i += 4;
		break;
	    case 37:
		this.mudaH(this.dec8(this.H()));
		i += 4;
		break;
	    case 45:
		this.mudaL(this.dec8(this.L()));
		i += 4;
		break;
	    case 53: {
		var i_32_ = this.HL();
		this.pokeb(i_32_, this.dec8(this.peekb(i_32_)));
		i += 11;
		break;
	    }
	    case 61:
		this.mudaA(this.dec8(this.A()));
		i += 4;
		break;
	    case 6:
		this.mudaB(this.nxtpcb());
		i += 7;
		break;
	    case 14:
		this.mudaC(this.nxtpcb());
		i += 7;
		break;
	    case 22:
		this.mudaD(this.nxtpcb());
		i += 7;
		break;
	    case 30:
		this.mudaE(this.nxtpcb());
		i += 7;
		break;
	    case 38:
		this.mudaH(this.nxtpcb());
		i += 7;
		break;
	    case 46:
		this.mudaL(this.nxtpcb());
		i += 7;
		break;
	    case 54:
		this.pokeb(this.HL(), this.nxtpcb());
		i += 10;
		break;
	    case 62:
		this.mudaA(this.nxtpcb());
		i += 7;
		break;
	    case 7:
		this.rlc_a();
		i += 4;
		break;
	    case 15:
		this.rrc_a();
		i += 4;
		break;
	    case 23:
		this.rl_a();
		i += 4;
		break;
	    case 31:
		this.rr_a();
		i += 4;
		break;
	    case 39:
		this.daa_a();
		i += 4;
		break;
	    case 47:
		this.cpl_a();
		i += 4;
		break;
	    case 55:
		this.scf();
		i += 4;
		break;
	    case 63:
		this.ccf();
		i += 4;
		break;
	    case 64:
		i += 4;
		break;
	    case 65:
		this.mudaB(this.C());
		i += 4;
		break;
	    case 66:
		this.mudaB(this.D());
		i += 4;
		break;
	    case 67:
		this.mudaB(this.E());
		i += 4;
		break;
	    case 68:
		this.mudaB(this.H());
		i += 4;
		break;
	    case 69:
		this.mudaB(this.L());
		i += 4;
		break;
	    case 70:
		this.mudaB(this.peekb(this.HL()));
		i += 7;
		break;
	    case 71:
		this.mudaB(this.A());
		i += 4;
		break;
	    case 72:
		this.mudaC(this.B());
		i += 4;
		break;
	    case 73:
		i += 4;
		break;
	    case 74:
		this.mudaC(this.D());
		i += 4;
		break;
	    case 75:
		this.mudaC(this.E());
		i += 4;
		break;
	    case 76:
		this.mudaC(this.H());
		i += 4;
		break;
	    case 77:
		this.mudaC(this.L());
		i += 4;
		break;
	    case 78:
		this.mudaC(this.peekb(this.HL()));
		i += 7;
		break;
	    case 79:
		this.mudaC(this.A());
		i += 4;
		break;
	    case 80:
		this.mudaD(this.B());
		i += 4;
		break;
	    case 81:
		this.mudaD(this.C());
		i += 4;
		break;
	    case 82:
		i += 4;
		break;
	    case 83:
		this.mudaD(this.E());
		i += 4;
		break;
	    case 84:
		this.mudaD(this.H());
		i += 4;
		break;
	    case 85:
		this.mudaD(this.L());
		i += 4;
		break;
	    case 86:
		this.mudaD(this.peekb(this.HL()));
		i += 7;
		break;
	    case 87:
		this.mudaD(this.A());
		i += 4;
		break;
	    case 88:
		this.mudaE(this.B());
		i += 4;
		break;
	    case 89:
		this.mudaE(this.C());
		i += 4;
		break;
	    case 90:
		this.mudaE(this.D());
		i += 4;
		break;
	    case 91:
		i += 4;
		break;
	    case 92:
		this.mudaE(this.H());
		i += 4;
		break;
	    case 93:
		this.mudaE(this.L());
		i += 4;
		break;
	    case 94:
		this.mudaE(this.peekb(this.HL()));
		i += 7;
		break;
	    case 95:
		this.mudaE(this.A());
		i += 4;
		break;
	    case 96:
		this.mudaH(this.B());
		i += 4;
		break;
	    case 97:
		this.mudaH(this.C());
		i += 4;
		break;
	    case 98:
		this.mudaH(this.D());
		i += 4;
		break;
	    case 99:
		this.mudaH(this.E());
		i += 4;
		break;
	    case 100:
		i += 4;
		break;
	    case 101:
		this.mudaH(this.L());
		i += 4;
		break;
	    case 102:
		this.mudaH(this.peekb(this.HL()));
		i += 7;
		break;
	    case 103:
		this.mudaH(this.A());
		i += 4;
		break;
	    case 104:
		this.mudaL(this.B());
		i += 4;
		break;
	    case 105:
		this.mudaL(this.C());
		i += 4;
		break;
	    case 106:
		this.mudaL(this.D());
		i += 4;
		break;
	    case 107:
		this.mudaL(this.E());
		i += 4;
		break;
	    case 108:
		this.mudaL(this.H());
		i += 4;
		break;
	    case 109:
		i += 4;
		break;
	    case 110:
		this.mudaL(this.peekb(this.HL()));
		i += 7;
		break;
	    case 111:
		this.mudaL(this.A());
		i += 4;
		break;
	    case 112:
		this.pokeb(this.HL(), this.B());
		i += 7;
		break;
	    case 113:
		this.pokeb(this.HL(), this.C());
		i += 7;
		break;
	    case 114:
		this.pokeb(this.HL(), this.D());
		i += 7;
		break;
	    case 115:
		this.pokeb(this.HL(), this.E());
		i += 7;
		break;
	    case 116:
		this.pokeb(this.HL(), this.H());
		i += 7;
		break;
	    case 117:
		this.pokeb(this.HL(), this.L());
		i += 7;
		break;
	    case 118: {
		var i_33_ = (-i - 1) / 4 + 1;
		i += i_33_ * 4;
		this.REFRESH(i_33_ - 1);
		break;
	    }
	    case 119:
		this.pokeb(this.HL(), this.A());
		i += 7;
		break;
	    case 120:
		this.mudaA(this.B());
		i += 4;
		break;
	    case 121:
		this.mudaA(this.C());
		i += 4;
		break;
	    case 122:
		this.mudaA(this.D());
		i += 4;
		break;
	    case 123:
		this.mudaA(this.E());
		i += 4;
		break;
	    case 124:
		this.mudaA(this.H());
		i += 4;
		break;
	    case 125:
		this.mudaA(this.L());
		i += 4;
		break;
	    case 126:
		this.mudaA(this.peekb(this.HL()));
		i += 7;
		break;
	    case 127:
		i += 4;
		break;
	    case 128:
		this.add_a(this.B());
		i += 4;
		break;
	    case 129:
		this.add_a(this.C());
		i += 4;
		break;
	    case 130:
		this.add_a(this.D());
		i += 4;
		break;
	    case 131:
		this.add_a(this.E());
		i += 4;
		break;
	    case 132:
		this.add_a(this.H());
		i += 4;
		break;
	    case 133:
		this.add_a(this.L());
		i += 4;
		break;
	    case 134:
		this.add_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 135:
		this.add_a(this.A());
		i += 4;
		break;
	    case 136:
		this.adc_a(this.B());
		i += 4;
		break;
	    case 137:
		this.adc_a(this.C());
		i += 4;
		break;
	    case 138:
		this.adc_a(this.D());
		i += 4;
		break;
	    case 139:
		this.adc_a(this.E());
		i += 4;
		break;
	    case 140:
		this.adc_a(this.H());
		i += 4;
		break;
	    case 141:
		this.adc_a(this.L());
		i += 4;
		break;
	    case 142:
		this.adc_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 143:
		this.adc_a(this.A());
		i += 4;
		break;
	    case 144:
		this.sub_a(this.B());
		i += 4;
		break;
	    case 145:
		this.sub_a(this.C());
		i += 4;
		break;
	    case 146:
		this.sub_a(this.D());
		i += 4;
		break;
	    case 147:
		this.sub_a(this.E());
		i += 4;
		break;
	    case 148:
		this.sub_a(this.H());
		i += 4;
		break;
	    case 149:
		this.sub_a(this.L());
		i += 4;
		break;
	    case 150:
		this.sub_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 151:
		this.sub_a(this.A());
		i += 4;
		break;
	    case 152:
		this.sbc_a(this.B());
		i += 4;
		break;
	    case 153:
		this.sbc_a(this.C());
		i += 4;
		break;
	    case 154:
		this.sbc_a(this.D());
		i += 4;
		break;
	    case 155:
		this.sbc_a(this.E());
		i += 4;
		break;
	    case 156:
		this.sbc_a(this.H());
		i += 4;
		break;
	    case 157:
		this.sbc_a(this.L());
		i += 4;
		break;
	    case 158:
		this.sbc_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 159:
		this.sbc_a(this.A());
		i += 4;
		break;
	    case 160:
		this.and_a(this.B());
		i += 4;
		break;
	    case 161:
		this.and_a(this.C());
		i += 4;
		break;
	    case 162:
		this.and_a(this.D());
		i += 4;
		break;
	    case 163:
		this.and_a(this.E());
		i += 4;
		break;
	    case 164:
		this.and_a(this.H());
		i += 4;
		break;
	    case 165:
		this.and_a(this.L());
		i += 4;
		break;
	    case 166:
		this.and_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 167:
		this.and_a(this.A());
		i += 4;
		break;
	    case 168:
		this.xor_a(this.B());
		i += 4;
		break;
	    case 169:
		this.xor_a(this.C());
		i += 4;
		break;
	    case 170:
		this.xor_a(this.D());
		i += 4;
		break;
	    case 171:
		this.xor_a(this.E());
		i += 4;
		break;
	    case 172:
		this.xor_a(this.H());
		i += 4;
		break;
	    case 173:
		this.xor_a(this.L());
		i += 4;
		break;
	    case 174:
		this.xor_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 175:
		this.xor_a(this.A());
		i += 4;
		break;
	    case 176:
		this.or_a(this.B());
		i += 4;
		break;
	    case 177:
		this.or_a(this.C());
		i += 4;
		break;
	    case 178:
		this.or_a(this.D());
		i += 4;
		break;
	    case 179:
		this.or_a(this.E());
		i += 4;
		break;
	    case 180:
		this.or_a(this.H());
		i += 4;
		break;
	    case 181:
		this.or_a(this.L());
		i += 4;
		break;
	    case 182:
		this.or_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 183:
		this.or_a(this.A());
		i += 4;
		break;
	    case 184:
		this.cp_a(this.B());
		i += 4;
		break;
	    case 185:
		this.cp_a(this.C());
		i += 4;
		break;
	    case 186:
		this.cp_a(this.D());
		i += 4;
		break;
	    case 187:
		this.cp_a(this.E());
		i += 4;
		break;
	    case 188:
		this.cp_a(this.H());
		i += 4;
		break;
	    case 189:
		this.cp_a(this.L());
		i += 4;
		break;
	    case 190:
		this.cp_a(this.peekb(this.HL()));
		i += 7;
		break;
	    case 191:
		this.cp_a(this.A());
		i += 4;
		break;
	    case 192:
		if (!this.Zset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 200:
		if (this.Zset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 208:
		if (!this.Cset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 216:
		if (this.Cset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 224:
		if (!this.PVset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 232:
		if (this.PVset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 240:
		if (!this.Sset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 248:
		if (this.Sset()) {
		    this.poppc();
		    i += 11;
		} else
		    i += 5;
		break;
	    case 193:
		this.mudaBC(this.popw());
		i += 10;
		break;
	    case 201:
		this.poppc();
		i += 10;
		break;
	    case 209:
		this.mudaDE(this.popw());
		i += 10;
		break;
	    case 217:
		this.exx();
		i += 4;
		break;
	    case 225:
		this.mudaHL(this.popw());
		i += 10;
		break;
	    case 233:
		this.mudaPC(this.HL());
		i += 4;
		break;
	    case 241:
		this.mudaAF(this.popw());
		i += 10;
		break;
	    case 249:
		this.mudaSP(this.HL());
		i += 6;
		break;
	    case 194:
		if (!this.Zset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 202:
		if (this.Zset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 210:
		if (!this.Cset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 218:
		if (this.Cset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 226:
		if (!this.PVset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 234:
		if (this.PVset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 242:
		if (!this.Sset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 250:
		if (this.Sset())
		    this.mudaPC(this.nxtpcw());
		else
		    this.mudaPC(this.PC() + 2 & 0xffff);
		i += 10;
		break;
	    case 195:
		this.mudaPC(this.peekw(this.PC()));
		i += 10;
		break;
	    case 203:
		i += this.execute_cb();
		break;
	    case 211:
		this.outb(this.nxtpcb(), this.A(), i);
		i += 11;
		break;
	    case 219:
		this.mudaA(this.inb(this.nxtpcb()));
		i += 11;
		break;
	    case 227: {
		var i_34_ = this.HL();
		var i_35_ = this.SP();
		this.mudaHL(this.peekw(i_35_));
		this.pokew(i_35_, i_34_);
		i += 19;
		break;
	    }
	    case 235: {
		var i_36_ = this.HL();
		this.mudaHL(this.DE());
		this.mudaDE(i_36_);
		i += 4;
		break;
	    }
	    case 243:
		this.mudaIFF1(false);
		this.mudaIFF2(false);
		i += 4;
		break;
	    case 251:
		this.mudaIFF1(true);
		this.mudaIFF2(true);
		i += 4;
		break;
	    case 196:
		if (!this.Zset()) {
		    var i_37_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_37_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 204:
		if (this.Zset()) {
		    var i_38_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_38_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 212:
		if (!this.Cset()) {
		    var i_39_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_39_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 220:
		if (this.Cset()) {
		    var i_40_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_40_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 228:
		if (!this.PVset()) {
		    var i_41_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_41_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 236:
		if (this.PVset()) {
		    var i_42_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_42_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 244:
		if (!this.Sset()) {
		    var i_43_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_43_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 252:
		if (this.Sset()) {
		    var i_44_ = this.nxtpcw();
		    this.pushpc();
		    this.mudaPC(i_44_);
		    i += 17;
		} else {
		    this.mudaPC(this.PC() + 2 & 0xffff);
		    i += 10;
		}
		break;
	    case 197:
		this.pushw(this.BC());
		i += 11;
		break;
	    case 205: {
		var i_45_ = this.nxtpcw();
		this.pushpc();
		this.mudaPC(i_45_);
		i += 17;
		break;
	    }
	    case 213:
		this.pushw(this.DE());
		i += 11;
		break;
	    case 221:
		this.mudaID(this.IX());
		i += this.execute_id();
		this.mudaIX(this.ID());
		break;
	    case 229:
		this.pushw(this.HL());
		i += 11;
		break;
	    case 237:
		i += this.execute_ed(i);
		break;
	    case 245:
		this.pushw(this.AF());
		i += 11;
		break;
	    case 253:
		this.mudaID(this.IY());
		i += this.execute_id();
		this.mudaIY(this.ID());
		break;
	    case 198:
		this.add_a(this.nxtpcb());
		i += 7;
		break;
	    case 206:
		this.adc_a(this.nxtpcb());
		i += 7;
		break;
	    case 214:
		this.sub_a(this.nxtpcb());
		i += 7;
		break;
	    case 222:
		this.sbc_a(this.nxtpcb());
		i += 7;
		break;
	    case 230:
		this.and_a(this.nxtpcb());
		i += 7;
		break;
	    case 238:
		this.xor_a(this.nxtpcb());
		i += 7;
		break;
	    case 246:
		this.or_a(this.nxtpcb());
		i += 7;
		break;
	    case 254:
		this.cp_a(this.nxtpcb());
		i += 7;
		break;
	    case 199:
		this.pushpc();
		this.mudaPC(0);
		i += 11;
		break;
	    case 207:
		this.pushpc();
		this.mudaPC(8);
		i += 11;
		break;
	    case 215:
		this.pushpc();
		this.mudaPC(16);
		i += 11;
		break;
	    case 223:
		this.pushpc();
		this.mudaPC(24);
		i += 11;
		break;
	    case 231:
		this.pushpc();
		this.mudaPC(32);
		i += 11;
		break;
	    case 239:
		this.pushpc();
		this.mudaPC(40);
		i += 11;
		break;
	    case 247:
		this.pushpc();
		this.mudaPC(48);
		i += 11;
		break;
	    case 255:
		this.pushpc();
		this.mudaPC(56);
		i += 11;
	    }
	}
    }
    
    this.execute_cb = function() {
	this.REFRESH(1);
	switch (this.nxtpcb()) {
	case 0:
	    this.mudaB(this.rlc(this.B()));
	    return 8;
	case 1:
	    this.mudaC(this.rlc(this.C()));
	    return 8;
	case 2:
	    this.mudaD(this.rlc(this.D()));
	    return 8;
	case 3:
	    this.mudaE(this.rlc(this.E()));
	    return 8;
	case 4:
	    this.mudaH(this.rlc(this.H()));
	    return 8;
	case 5:
	    this.mudaL(this.rlc(this.L()));
	    return 8;
	case 6: {
	    var i = this.HL();
	    this.pokeb(i, this.rlc(this.peekb(i)));
	    return 15;
	}
	case 7:
	    this.mudaA(this.rlc(this.A()));
	    return 8;
	case 8:
	    this.mudaB(this.rrc(this.B()));
	    return 8;
	case 9:
	    this.mudaC(this.rrc(this.C()));
	    return 8;
	case 10:
	    this.mudaD(this.rrc(this.D()));
	    return 8;
	case 11:
	    this.mudaE(this.rrc(this.E()));
	    return 8;
	case 12:
	    this.mudaH(this.rrc(this.H()));
	    return 8;
	case 13:
	    this.mudaL(this.rrc(this.L()));
	    return 8;
	case 14: {
	    var i = this.HL();
	    this.pokeb(i, this.rrc(this.peekb(i)));
	    return 15;
	}
	case 15:
	    this.mudaA(this.rrc(this.A()));
	    return 8;
	case 16:
	    this.mudaB(this.rl(this.B()));
	    return 8;
	case 17:
	    this.mudaC(this.rl(this.C()));
	    return 8;
	case 18:
	    this.mudaD(this.rl(this.D()));
	    return 8;
	case 19:
	    this.mudaE(this.rl(this.E()));
	    return 8;
	case 20:
	    this.mudaH(this.rl(this.H()));
	    return 8;
	case 21:
	    this.mudaL(this.rl(this.L()));
	    return 8;
	case 22: {
	    var i = this.HL();
	    this.pokeb(i, this.rl(this.peekb(i)));
	    return 15;
	}
	case 23:
	    this.mudaA(this.rl(this.A()));
	    return 8;
	case 24:
	    this.mudaB(this.rr(this.B()));
	    return 8;
	case 25:
	    this.mudaC(this.rr(this.C()));
	    return 8;
	case 26:
	    this.mudaD(this.rr(this.D()));
	    return 8;
	case 27:
	    this.mudaE(this.rr(this.E()));
	    return 8;
	case 28:
	    this.mudaH(this.rr(this.H()));
	    return 8;
	case 29:
	    this.mudaL(this.rr(this.L()));
	    return 8;
	case 30: {
	    var i = this.HL();
	    this.pokeb(i, this.rr(this.peekb(i)));
	    return 15;
	}
	case 31:
	    this.mudaA(this.rr(this.A()));
	    return 8;
	case 32:
	    this.mudaB(this.sla(this.B()));
	    return 8;
	case 33:
	    this.mudaC(this.sla(this.C()));
	    return 8;
	case 34:
	    this.mudaD(this.sla(this.D()));
	    return 8;
	case 35:
	    this.mudaE(this.sla(this.E()));
	    return 8;
	case 36:
	    this.mudaH(this.sla(this.H()));
	    return 8;
	case 37:
	    this.mudaL(this.sla(this.L()));
	    return 8;
	case 38: {
	    var i = this.HL();
	    this.pokeb(i, this.sla(this.peekb(i)));
	    return 15;
	}
	case 39:
	    this.mudaA(this.sla(this.A()));
	    return 8;
	case 40:
	    this.mudaB(this.sra(this.B()));
	    return 8;
	case 41:
	    this.mudaC(this.sra(this.C()));
	    return 8;
	case 42:
	    this.mudaD(this.sra(this.D()));
	    return 8;
	case 43:
	    this.mudaE(this.sra(this.E()));
	    return 8;
	case 44:
	    this.mudaH(this.sra(this.H()));
	    return 8;
	case 45:
	    this.mudaL(this.sra(this.L()));
	    return 8;
	case 46: {
	    var i = this.HL();
	    this.pokeb(i, this.sra(this.peekb(i)));
	    return 15;
	}
	case 47:
	    this.mudaA(this.sra(this.A()));
	    return 8;
	case 48:
	    this.mudaB(this.sls(this.B()));
	    return 8;
	case 49:
	    this.mudaC(this.sls(this.C()));
	    return 8;
	case 50:
	    this.mudaD(this.sls(this.D()));
	    return 8;
	case 51:
	    this.mudaE(this.sls(this.E()));
	    return 8;
	case 52:
	    this.mudaH(this.sls(this.H()));
	    return 8;
	case 53:
	    this.mudaL(this.sls(this.L()));
	    return 8;
	case 54: {
	    var i = this.HL();
	    this.pokeb(i, this.sls(this.peekb(i)));
	    return 15;
	}
	case 55:
	    this.mudaA(this.sls(this.A()));
	    return 8;
	case 56:
	    this.mudaB(this.srl(this.B()));
	    return 8;
	case 57:
	    this.mudaC(this.srl(this.C()));
	    return 8;
	case 58:
	    this.mudaD(this.srl(this.D()));
	    return 8;
	case 59:
	    this.mudaE(this.srl(this.E()));
	    return 8;
	case 60:
	    this.mudaH(this.srl(this.H()));
	    return 8;
	case 61:
	    this.mudaL(this.srl(this.L()));
	    return 8;
	case 62: {
	    var i = this.HL();
	    this.pokeb(i, this.srl(this.peekb(i)));
	    return 15;
	}
	case 63:
	    this.mudaA(this.srl(this.A()));
	    return 8;
	case 64:
	    this.bit(1, this.B());
	    return 8;
	case 65:
	    this.bit(1, this.C());
	    return 8;
	case 66:
	    this.bit(1, this.D());
	    return 8;
	case 67:
	    this.bit(1, this.E());
	    return 8;
	case 68:
	    this.bit(1, this.H());
	    return 8;
	case 69:
	    this.bit(1, this.L());
	    return 8;
	case 70:
	    this.bit(1, this.peekb(this.HL()));
	    return 12;
	case 71:
	    this.bit(1, this.A());
	    return 8;
	case 72:
	    this.bit(2, this.B());
	    return 8;
	case 73:
	    this.bit(2, this.C());
	    return 8;
	case 74:
	    this.bit(2, this.D());
	    return 8;
	case 75:
	    this.bit(2, this.E());
	    return 8;
	case 76:
	    this.bit(2, this.H());
	    return 8;
	case 77:
	    this.bit(2, this.L());
	    return 8;
	case 78:
	    this.bit(2, this.peekb(this.HL()));
	    return 12;
	case 79:
	    this.bit(2, this.A());
	    return 8;
	case 80:
	    this.bit(4, this.B());
	    return 8;
	case 81:
	    this.bit(4, this.C());
	    return 8;
	case 82:
	    this.bit(4, this.D());
	    return 8;
	case 83:
	    this.bit(4, this.E());
	    return 8;
	case 84:
	    this.bit(4, this.H());
	    return 8;
	case 85:
	    this.bit(4, this.L());
	    return 8;
	case 86:
	    this.bit(4, this.peekb(this.HL()));
	    return 12;
	case 87:
	    this.bit(4, this.A());
	    return 8;
	case 88:
	    this.bit(8, this.B());
	    return 8;
	case 89:
	    this.bit(8, this.C());
	    return 8;
	case 90:
	    this.bit(8, this.D());
	    return 8;
	case 91:
	    this.bit(8, this.E());
	    return 8;
	case 92:
	    this.bit(8, this.H());
	    return 8;
	case 93:
	    this.bit(8, this.L());
	    return 8;
	case 94:
	    this.bit(8, this.peekb(this.HL()));
	    return 12;
	case 95:
	    this.bit(8, this.A());
	    return 8;
	case 96:
	    this.bit(16, this.B());
	    return 8;
	case 97:
	    this.bit(16, this.C());
	    return 8;
	case 98:
	    this.bit(16, this.D());
	    return 8;
	case 99:
	    this.bit(16, this.E());
	    return 8;
	case 100:
	    this.bit(16, this.H());
	    return 8;
	case 101:
	    this.bit(16, this.L());
	    return 8;
	case 102:
	    this.bit(16, this.peekb(this.HL()));
	    return 12;
	case 103:
	    this.bit(16, this.A());
	    return 8;
	case 104:
	    this.bit(32, this.B());
	    return 8;
	case 105:
	    this.bit(32, this.C());
	    return 8;
	case 106:
	    this.bit(32, this.D());
	    return 8;
	case 107:
	    this.bit(32, this.E());
	    return 8;
	case 108:
	    this.bit(32, this.H());
	    return 8;
	case 109:
	    this.bit(32, this.L());
	    return 8;
	case 110:
	    this.bit(32, this.peekb(this.HL()));
	    return 12;
	case 111:
	    this.bit(32, this.A());
	    return 8;
	case 112:
	    this.bit(64, this.B());
	    return 8;
	case 113:
	    this.bit(64, this.C());
	    return 8;
	case 114:
	    this.bit(64, this.D());
	    return 8;
	case 115:
	    this.bit(64, this.E());
	    return 8;
	case 116:
	    this.bit(64, this.H());
	    return 8;
	case 117:
	    this.bit(64, this.L());
	    return 8;
	case 118:
	    this.bit(64, this.peekb(this.HL()));
	    return 12;
	case 119:
	    this.bit(64, this.A());
	    return 8;
	case 120:
	    this.bit(128, this.B());
	    return 8;
	case 121:
	    this.bit(128, this.C());
	    return 8;
	case 122:
	    this.bit(128, this.D());
	    return 8;
	case 123:
	    this.bit(128, this.E());
	    return 8;
	case 124:
	    this.bit(128, this.H());
	    return 8;
	case 125:
	    this.bit(128, this.L());
	    return 8;
	case 126:
	    this.bit(128, this.peekb(this.HL()));
	    return 12;
	case 127:
	    this.bit(128, this.A());
	    return 8;
	case 128:
	    this.mudaB(this.res(1, this.B()));
	    return 8;
	case 129:
	    this.mudaC(this.res(1, this.C()));
	    return 8;
	case 130:
	    this.mudaD(this.res(1, this.D()));
	    return 8;
	case 131:
	    this.mudaE(this.res(1, this.E()));
	    return 8;
	case 132:
	    this.mudaH(this.res(1, this.H()));
	    return 8;
	case 133:
	    this.mudaL(this.res(1, this.L()));
	    return 8;
	case 134: {
	    var i = this.HL();
	    this.pokeb(i, this.res(1, this.peekb(i)));
	    return 15;
	}
	case 135:
	    this.mudaA(this.res(1, this.A()));
	    return 8;
	case 136:
	    this.mudaB(this.res(2, this.B()));
	    return 8;
	case 137:
	    this.mudaC(this.res(2, this.C()));
	    return 8;
	case 138:
	    this.mudaD(this.res(2, this.D()));
	    return 8;
	case 139:
	    this.mudaE(this.res(2, this.E()));
	    return 8;
	case 140:
	    this.mudaH(this.res(2, this.H()));
	    return 8;
	case 141:
	    this.mudaL(this.res(2, this.L()));
	    return 8;
	case 142: {
	    var i = this.HL();
	    this.pokeb(i, this.res(2, this.peekb(i)));
	    return 15;
	}
	case 143:
	    this.mudaA(this.res(2, this.A()));
	    return 8;
	case 144:
	    this.mudaB(this.res(4, this.B()));
	    return 8;
	case 145:
	    this.mudaC(this.res(4, this.C()));
	    return 8;
	case 146:
	    this.mudaD(this.res(4, this.D()));
	    return 8;
	case 147:
	    this.mudaE(this.res(4, this.E()));
	    return 8;
	case 148:
	    this.mudaH(this.res(4, this.H()));
	    return 8;
	case 149:
	    this.mudaL(this.res(4, this.L()));
	    return 8;
	case 150: {
	    var i = this.HL();
	    this.pokeb(i, this.res(4, this.peekb(i)));
	    return 15;
	}
	case 151:
	    this.mudaA(this.res(4, this.A()));
	    return 8;
	case 152:
	    this.mudaB(this.res(8, this.B()));
	    return 8;
	case 153:
	    this.mudaC(this.res(8, this.C()));
	    return 8;
	case 154:
	    this.mudaD(this.res(8, this.D()));
	    return 8;
	case 155:
	    this.mudaE(this.res(8, this.E()));
	    return 8;
	case 156:
	    this.mudaH(this.res(8, this.H()));
	    return 8;
	case 157:
	    this.mudaL(this.res(8, this.L()));
	    return 8;
	case 158: {
	    var i = this.HL();
	    this.pokeb(i, this.res(8, this.peekb(i)));
	    return 15;
	}
	case 159:
	    this.mudaA(this.res(8, this.A()));
	    return 8;
	case 160:
	    this.mudaB(this.res(16, this.B()));
	    return 8;
	case 161:
	    this.mudaC(this.res(16, this.C()));
	    return 8;
	case 162:
	    this.mudaD(this.res(16, this.D()));
	    return 8;
	case 163:
	    this.mudaE(this.res(16, this.E()));
	    return 8;
	case 164:
	    this.mudaH(this.res(16, this.H()));
	    return 8;
	case 165:
	    this.mudaL(this.res(16, this.L()));
	    return 8;
	case 166: {
	    var i = this.HL();
	    this.pokeb(i, this.res(16, this.peekb(i)));
	    return 15;
	}
	case 167:
	    this.mudaA(this.res(16, this.A()));
	    return 8;
	case 168:
	    this.mudaB(this.res(32, this.B()));
	    return 8;
	case 169:
	    this.mudaC(this.res(32, this.C()));
	    return 8;
	case 170:
	    this.mudaD(this.res(32, this.D()));
	    return 8;
	case 171:
	    this.mudaE(this.res(32, this.E()));
	    return 8;
	case 172:
	    this.mudaH(this.res(32, this.H()));
	    return 8;
	case 173:
	    this.mudaL(this.res(32, this.L()));
	    return 8;
	case 174: {
	    var i = this.HL();
	    this.pokeb(i, this.res(32, this.peekb(i)));
	    return 15;
	}
	case 175:
	    this.mudaA(this.res(32, this.A()));
	    return 8;
	case 176:
	    this.mudaB(this.res(64, this.B()));
	    return 8;
	case 177:
	    this.mudaC(this.res(64, this.C()));
	    return 8;
	case 178:
	    this.mudaD(this.res(64, this.D()));
	    return 8;
	case 179:
	    this.mudaE(this.res(64, this.E()));
	    return 8;
	case 180:
	    this.mudaH(this.res(64, this.H()));
	    return 8;
	case 181:
	    this.mudaL(this.res(64, this.L()));
	    return 8;
	case 182: {
	    var i = this.HL();
	    this.pokeb(i, this.res(64, this.peekb(i)));
	    return 15;
	}
	case 183:
	    this.mudaA(this.res(64, this.A()));
	    return 8;
	case 184:
	    this.mudaB(this.res(128, this.B()));
	    return 8;
	case 185:
	    this.mudaC(this.res(128, this.C()));
	    return 8;
	case 186:
	    this.mudaD(this.res(128, this.D()));
	    return 8;
	case 187:
	    this.mudaE(this.res(128, this.E()));
	    return 8;
	case 188:
	    this.mudaH(this.res(128, this.H()));
	    return 8;
	case 189:
	    this.mudaL(this.res(128, this.L()));
	    return 8;
	case 190: {
	    var i = this.HL();
	    this.pokeb(i, this.res(128, this.peekb(i)));
	    return 15;
	}
	case 191:
	    this.mudaA(this.res(128, this.A()));
	    return 8;
	case 192:
	    this.mudaB(this.set(1, this.B()));
	    return 8;
	case 193:
	    this.mudaC(this.set(1, this.C()));
	    return 8;
	case 194:
	    this.mudaD(this.set(1, this.D()));
	    return 8;
	case 195:
	    this.mudaE(this.set(1, this.E()));
	    return 8;
	case 196:
	    this.mudaH(this.set(1, this.H()));
	    return 8;
	case 197:
	    this.mudaL(this.set(1, this.L()));
	    return 8;
	case 198: {
	    var i = this.HL();
	    this.pokeb(i, this.set(1, this.peekb(i)));
	    return 15;
	}
	case 199:
	    this.mudaA(this.set(1, this.A()));
	    return 8;
	case 200:
	    this.mudaB(this.set(2, this.B()));
	    return 8;
	case 201:
	    this.mudaC(this.set(2, this.C()));
	    return 8;
	case 202:
	    this.mudaD(this.set(2, this.D()));
	    return 8;
	case 203:
	    this.mudaE(this.set(2, this.E()));
	    return 8;
	case 204:
	    this.mudaH(this.set(2, this.H()));
	    return 8;
	case 205:
	    this.mudaL(this.set(2, this.L()));
	    return 8;
	case 206: {
	    var i = this.HL();
	    this.pokeb(i, this.set(2, this.peekb(i)));
	    return 15;
	}
	case 207:
	    this.mudaA(this.set(2, this.A()));
	    return 8;
	case 208:
	    this.mudaB(this.set(4, this.B()));
	    return 8;
	case 209:
	    this.mudaC(this.set(4, this.C()));
	    return 8;
	case 210:
	    this.mudaD(this.set(4, this.D()));
	    return 8;
	case 211:
	    this.mudaE(this.set(4, this.E()));
	    return 8;
	case 212:
	    this.mudaH(this.set(4, this.H()));
	    return 8;
	case 213:
	    this.mudaL(this.set(4, this.L()));
	    return 8;
	case 214: {
	    var i = this.HL();
	    this.pokeb(i, this.set(4, this.peekb(i)));
	    return 15;
	}
	case 215:
	    this.mudaA(this.set(4, this.A()));
	    return 8;
	case 216:
	    this.mudaB(this.set(8, this.B()));
	    return 8;
	case 217:
	    this.mudaC(this.set(8, this.C()));
	    return 8;
	case 218:
	    this.mudaD(this.set(8, this.D()));
	    return 8;
	case 219:
	    this.mudaE(this.set(8, this.E()));
	    return 8;
	case 220:
	    this.mudaH(this.set(8, this.H()));
	    return 8;
	case 221:
	    this.mudaL(this.set(8, this.L()));
	    return 8;
	case 222: {
	    var i = this.HL();
	    this.pokeb(i, this.set(8, this.peekb(i)));
	    return 15;
	}
	case 223:
	    this.mudaA(this.set(8, this.A()));
	    return 8;
	case 224:
	    this.mudaB(this.set(16, this.B()));
	    return 8;
	case 225:
	    this.mudaC(this.set(16, this.C()));
	    return 8;
	case 226:
	    this.mudaD(this.set(16, this.D()));
	    return 8;
	case 227:
	    this.mudaE(this.set(16, this.E()));
	    return 8;
	case 228:
	    this.mudaH(this.set(16, this.H()));
	    return 8;
	case 229:
	    this.mudaL(this.set(16, this.L()));
	    return 8;
	case 230: {
	    var i = this.HL();
	    this.pokeb(i, this.set(16, this.peekb(i)));
	    return 15;
	}
	case 231:
	    this.mudaA(this.set(16, this.A()));
	    return 8;
	case 232:
	    this.mudaB(this.set(32, this.B()));
	    return 8;
	case 233:
	    this.mudaC(this.set(32, this.C()));
	    return 8;
	case 234:
	    this.mudaD(this.set(32, this.D()));
	    return 8;
	case 235:
	    this.mudaE(this.set(32, this.E()));
	    return 8;
	case 236:
	    this.mudaH(this.set(32, this.H()));
	    return 8;
	case 237:
	    this.mudaL(this.set(32, this.L()));
	    return 8;
	case 238: {
	    var i = this.HL();
	    this.pokeb(i, this.set(32, this.peekb(i)));
	    return 15;
	}
	case 239:
	    this.mudaA(this.set(32, this.A()));
	    return 8;
	case 240:
	    this.mudaB(this.set(64, this.B()));
	    return 8;
	case 241:
	    this.mudaC(this.set(64, this.C()));
	    return 8;
	case 242:
	    this.mudaD(this.set(64, this.D()));
	    return 8;
	case 243:
	    this.mudaE(this.set(64, this.E()));
	    return 8;
	case 244:
	    this.mudaH(this.set(64, this.H()));
	    return 8;
	case 245:
	    this.mudaL(this.set(64, this.L()));
	    return 8;
	case 246: {
	    var i = this.HL();
	    this.pokeb(i, this.set(64, this.peekb(i)));
	    return 15;
	}
	case 247:
	    this.mudaA(this.set(64, this.A()));
	    return 8;
	case 248:
	    this.mudaB(this.set(128, this.B()));
	    return 8;
	case 249:
	    this.mudaC(this.set(128, this.C()));
	    return 8;
	case 250:
	    this.mudaD(this.set(128, this.D()));
	    return 8;
	case 251:
	    this.mudaE(this.set(128, this.E()));
	    return 8;
	case 252:
	    this.mudaH(this.set(128, this.H()));
	    return 8;
	case 253:
	    this.mudaL(this.set(128, this.L()));
	    return 8;
	case 254: {
	    var i = this.HL();
	    this.pokeb(i, this.set(128, this.peekb(i)));
	    return 15;
	}
	case 255:
	    this.mudaA(this.set(128, this.A()));
	    return 8;
	default:
	    return 0;
	}
    }
    
    this.execute_ed = function(i) {
	this.REFRESH(1);
	switch (this.nxtpcb()) {
	case 0:
	case 1:
	case 2:
	case 3:
	case 4:
	case 5:
	case 6:
	case 7:
	case 8:
	case 9:
	case 10:
	case 11:
	case 12:
	case 13:
	case 14:
	case 15:
	case 16:
	case 17:
	case 18:
	case 19:
	case 20:
	case 21:
	case 22:
	case 23:
	case 24:
	case 25:
	case 26:
	case 27:
	case 28:
	case 29:
	case 30:
	case 31:
	case 32:
	case 33:
	case 34:
	case 35:
	case 36:
	case 37:
	case 38:
	case 39:
	case 40:
	case 41:
	case 42:
	case 43:
	case 44:
	case 45:
	case 46:
	case 47:
	case 48:
	case 49:
	case 50:
	case 51:
	case 52:
	case 53:
	case 54:
	case 55:
	case 56:
	case 57:
	case 58:
	case 59:
	case 60:
	case 61:
	case 62:
	case 63:
	case 127:
	case 128:
	case 129:
	case 130:
	case 131:
	case 132:
	case 133:
	case 134:
	case 135:
	case 136:
	case 137:
	case 138:
	case 139:
	case 140:
	case 141:
	case 142:
	case 143:
	case 144:
	case 145:
	case 146:
	case 147:
	case 148:
	case 149:
	case 150:
	case 151:
	case 152:
	case 153:
	case 154:
	case 155:
	case 156:
	case 157:
	case 158:
	case 159:
	case 164:
	case 165:
	case 166:
	case 167:
	case 172:
	case 173:
	case 174:
	case 175:
	case 180:
	case 181:
	case 182:
	case 183:
	    return 8;
	case 64:
	    this.mudaB(this.in_bc());
	    return 12;
	case 72:
	    this.mudaC(this.in_bc());
	    return 12;
	case 80:
	    this.mudaD(this.in_bc());
	    return 12;
	case 88:
	    this.mudaE(this.in_bc());
	    return 12;
	case 96:
	    this.mudaH(this.in_bc());
	    return 12;
	case 104:
	    this.mudaL(this.in_bc());
	    return 12;
	case 112:
	    this.in_bc();
	    return 12;
	case 120:
	    this.mudaA(this.in_bc());
	    return 12;
	case 65:
	    this.outb(this.C(), this.B(), i);
	    return 12;
	case 73:
	    this.outb(this.C(), this.C(), i);
	    return 12;
	case 81:
	    this.outb(this.C(), this.D(), i);
	    return 12;
	case 89:
	    this.outb(this.C(), this.E(), i);
	    return 12;
	case 97:
	    this.outb(this.C(), this.H(), i);
	    return 12;
	case 105:
	    this.outb(this.C(), this.L(), i);
	    return 12;
	case 113:
	    this.outb(this.C(), 0, i);
	    return 12;
	case 121:
	    this.outb(this.C(), this.A(), i);
	    return 12;
	case 66:
	    this.mudaHL(this.sbc16(this.HL(), this.BC()));
	    return 15;
	case 74:
	    this.mudaHL(this.adc16(this.HL(), this.BC()));
	    return 15;
	case 82:
	    this.mudaHL(this.sbc16(this.HL(), this.DE()));
	    return 15;
	case 90:
	    this.mudaHL(this.adc16(this.HL(), this.DE()));
	    return 15;
	case 98: {
	    var i_46_ = this.HL();
	    this.mudaHL(this.sbc16(i_46_, i_46_));
	    return 15;
	}
	case 106: {
	    var i_47_ = this.HL();
	    this.mudaHL(this.adc16(i_47_, i_47_));
	    return 15;
	}
	case 114:
	    this.mudaHL(this.sbc16(this.HL(), this.SP()));
	    return 15;
	case 122:
	    this.mudaHL(this.adc16(this.HL(), this.SP()));
	    return 15;
	case 67:
	    this.pokew(this.nxtpcw(), this.BC());
	    return 20;
	case 75:
	    this.mudaBC(this.peekw(this.nxtpcw()));
	    return 20;
	case 83:
	    this.pokew(this.nxtpcw(), this.DE());
	    return 20;
	case 91:
	    this.mudaDE(this.peekw(this.nxtpcw()));
	    return 20;
	case 99:
	    this.pokew(this.nxtpcw(), this.HL());
	    return 20;
	case 107:
	    this.mudaHL(this.peekw(this.nxtpcw()));
	    return 20;
	case 115:
	    this.pokew(this.nxtpcw(), this.SP());
	    return 20;
	case 123:
	    this.mudaSP(this.peekw(this.nxtpcw()));
	    return 20;
	case 68:
	case 76:
	case 84:
	case 92:
	case 100:
	case 108:
	case 116:
	case 124:
	    this.neg_a();
	    return 8;
	case 69:
	case 85:
	case 101:
	case 117:
	    this.mudaIFF1(this.IFF2());
	    this.poppc();
	    return 14;
	case 77:
	case 93:
	case 109:
	case 125:
	    this.poppc();
	    return 14;
	case 70:
	case 78:
	case 102:
	case 110:
	    this.mudaIM(0);
	    return 8;
	case 86:
	case 118:
	    this.mudaIM(1);
	    return 8;
	case 94:
	case 126:
	    this.mudaIM(2);
	    return 8;
	case 71:
	    this.mudaI(this.A());
	    return 9;
	case 79:
	    this.mudaR(this.A());
	    return 9;
	case 87:
	    this.ld_a_i();
	    return 9;
	case 95:
	    this.ld_a_r();
	    return 9;
	case 103:
	    this.rrd_a();
	    return 18;
	case 111:
	    this.rld_a();
	    return 18;
	case 160:
	    this.pokeb(this.DE(), this.peekb(this.HL()));
	    this.mudaDE(this.inc16(this.DE()));
	    this.mudaHL(this.inc16(this.HL()));
	    this.mudaBC(this.dec16(this.BC()));
	    this.setPV(this.BC() != 0);
	    this.setH(false);
	    this.setN(false);
	    return 16;
	case 161: {
	    var bool = this.Cset();
	    this.cp_a(this.peekb(this.HL()));
	    this.mudaHL(this.inc16(this.HL()));
	    this.mudaBC(this.dec16(this.BC()));
	    this.setPV(this.BC() != 0);
	    this.setC(bool);
	    return 16;
	}
	case 162:
	    this.pokeb(this.HL(), this.inb(this.C()));
	    this.mudaB(this.dec8(this.B()));
	    this.mudaHL(this.inc16(this.HL()));
	    return 16;
	case 163:
	    this.mudaB(this.dec8(this.B()));
	    this.outb(this.C(), this.peekb(this.HL()), i);
	    this.mudaHL(this.inc16(this.HL()));
	    return 16;
	case 168:
	    this.pokeb(this.DE(), this.peekb(this.HL()));
	    this.mudaDE(this.dec16(this.DE()));
	    this.mudaHL(this.dec16(this.HL()));
	    this.mudaBC(this.dec16(this.BC()));
	    this.setPV(this.BC() != 0);
	    this.setH(false);
	    this.setN(false);
	    return 16;
	case 169: {
	    var bool = this.Cset();
	    this.cp_a(this.peekb(this.HL()));
	    this.mudaHL(this.dec16(this.HL()));
	    this.mudaBC(this.dec16(this.BC()));
	    this.setPV(this.BC() != 0);
	    return 16;
	}
	case 170:
	    this.pokeb(this.HL(), this.inb(this.C()));
	    this.mudaB(this.dec8(this.B()));
	    this.mudaHL(this.dec16(this.HL()));
	    return 16;
	case 171:
	    this.mudaB(this.dec8(this.B()));
	    this.outb(this.C(), this.peekb(this.HL()), i);
	    this.mudaHL(this.dec16(this.HL()));
	    return 16;
	case 176: {
	    var bool = false;
	    this.pokeb(this.DE(), this.peekb(this.HL()));
	    this.mudaHL(this.inc16(this.HL()));
	    this.mudaDE(this.inc16(this.DE()));
	    this.mudaBC(this.dec16(this.BC()));
	    var i_48_ = 21;
	    this.REFRESH(4);
	    if (this.BC() != 0) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		this.setH(false);
		this.setN(false);
		this.setPV(true);
	    } else {
		i_48_ -= 5;
		this.setH(false);
		this.setN(false);
		this.setPV(false);
	    }
	    return i_48_;
	}
	case 177: {
	    var bool = this.Cset();
	    this.cp_a(this.peekb(this.HL()));
	    this.mudaHL(this.inc16(this.HL()));
	    this.mudaBC(this.dec16(this.BC()));
	    var bool_49_ = this.BC() != 0;
	    this.setPV(bool_49_);
	    this.setC(bool);
	    if (bool_49_ && !this.Zset()) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		return 21;
	    }
	    return 16;
	}
	case 178: {
	    var bool = false;
	    this.pokeb(this.HL(), this.inb(this.C()));
	    var i_50_ = 0;
	    this.mudaB(i_50_ = this.dec8(this.B()));
	    this.mudaHL(this.inc16(this.HL()));
	    if (i_50_ != 0) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		return 21;
	    }
	    return 16;
	}
	case 179: {
	    var bool = false;
	    var i_51_ = 0;
	    this.mudaB(i_51_ = this.dec8(this.B()));
	    this.outb(this.C(), this.peekb(this.HL()), i);
	    this.mudaHL(this.inc16(this.HL()));
	    if (i_51_ != 0) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		return 21;
	    }
	    return 16;
	}
	case 184: {
	    var bool = false;
	    this.REFRESH(4);
	    this.pokeb(this.DE(), this.peekb(this.HL()));
	    this.mudaDE(this.dec16(this.DE()));
	    this.mudaHL(this.dec16(this.HL()));
	    this.mudaBC(this.dec16(this.BC()));
	    var i_52_ = 21;
	    if (this.BC() != 0) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		this.setH(false);
		this.setN(false);
		this.setPV(true);
	    } else {
		i_52_ -= 5;
		this.setH(false);
		this.setN(false);
		this.setPV(false);
	    }
	    return i_52_;
	}
	case 185: {
	    var bool = this.Cset();
	    this.cp_a(this.peekb(this.HL()));
	    this.mudaHL(this.dec16(this.HL()));
	    this.mudaBC(this.dec16(this.BC()));
	    var bool_53_ = this.BC() != 0;
	    this.setPV(bool_53_);
	    this.setC(bool);
	    if (bool_53_ && !this.Zset()) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		return 21;
	    }
	    return 16;
	}
	case 186: {
	    this.pokeb(this.HL(), this.inb(this.BC() & 0xff));
	    var i_54_ = 0;
	    this.mudaB(i_54_ = this.dec8(this.B()));
	    this.mudaHL(this.dec16(this.HL()));
	    if (i_54_ != 0) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		return 21;
	    }
	    return 16;
	}
	case 187: {
	    var i_55_ = 0;
	    this.mudaB(i_55_ = this.dec8(this.B()));
	    this.outb(this.C(), this.peekb(this.HL()), i);
	    this.mudaHL(this.dec16(this.HL()));
	    if (i_55_ != 0) {
		this.mudaPC(this.PC() - 2 & 0xffff);
		return 21;
	    }
	    return 16;
	}
	default:
	    return 8;
	}
    }
    
    this.execute_id = function() {
	this.REFRESH(1);
	switch (this.nxtpcb()) {
	case 0:
	case 1:
	case 2:
	case 3:
	case 4:
	case 5:
	case 6:
	case 7:
	case 8:
	case 10:
	case 11:
	case 12:
	case 13:
	case 14:
	case 15:
	case 16:
	case 17:
	case 18:
	case 19:
	case 20:
	case 21:
	case 22:
	case 23:
	case 24:
	case 26:
	case 27:
	case 28:
	case 29:
	case 30:
	case 31:
	case 32:
	case 39:
	case 40:
	case 47:
	case 48:
	case 49:
	case 50:
	case 51:
	case 55:
	case 56:
	case 58:
	case 59:
	case 60:
	case 61:
	case 62:
	case 63:
	case 64:
	case 65:
	case 66:
	case 67:
	case 71:
	case 72:
	case 73:
	case 74:
	case 75:
	case 79:
	case 80:
	case 81:
	case 82:
	case 83:
	case 87:
	case 88:
	case 89:
	case 90:
	case 91:
	case 95:
	case 120:
	case 121:
	case 122:
	case 123:
	case 127:
	case 128:
	case 129:
	case 130:
	case 131:
	case 135:
	case 136:
	case 137:
	case 138:
	case 139:
	case 143:
	case 144:
	case 145:
	case 146:
	case 147:
	case 151:
	case 152:
	case 153:
	case 154:
	case 155:
	case 159:
	case 160:
	case 161:
	case 162:
	case 163:
	case 167:
	case 168:
	case 169:
	case 170:
	case 171:
	case 175:
	case 176:
	case 177:
	case 178:
	case 179:
	case 183:
	case 184:
	case 185:
	case 186:
	case 187:
	case 191:
	case 192:
	case 193:
	case 194:
	case 195:
	case 196:
	case 197:
	case 198:
	case 199:
	case 200:
	case 201:
	case 202:
	case 204:
	case 205:
	case 206:
	case 207:
	case 208:
	case 209:
	case 210:
	case 211:
	case 212:
	case 213:
	case 214:
	case 215:
	case 216:
	case 217:
	case 218:
	case 219:
	case 220:
	case 221:
	case 222:
	case 223:
	case 224:
	case 226:
	case 228:
	case 230:
	case 231:
	case 232:
	case 234:
	case 235:
	case 236:
	case 237:
	case 238:
	case 239:
	case 240:
	case 241:
	case 242:
	case 243:
	case 244:
	case 245:
	case 246:
	case 247:
	case 248:
	    this.mudaPC(this.dec16(this.PC()));
	    this.REFRESH(-1);
	    return 4;
	case 9:
	    this.mudaID(this.add16(this.ID(), this.BC()));
	    return 15;
	case 25:
	    this.mudaID(this.add16(this.ID(), this.DE()));
	    return 15;
	case 41: {
	    var i = this.ID();
	    this.mudaID(this.add16(i, i));
	    return 15;
	}
	case 57:
	    this.mudaID(this.add16(this.ID(), this.SP()));
	    return 15;
	case 33:
	    this.mudaID(this.nxtpcw());
	    return 14;
	case 34:
	    this.pokew(this.nxtpcw(), this.ID());
	    return 20;
	case 42:
	    this.mudaID(this.peekw(this.nxtpcw()));
	    return 20;
	case 35:
	    this.mudaID(this.inc16(this.ID()));
	    return 10;
	case 43:
	    this.mudaID(this.dec16(this.ID()));
	    return 10;
	case 36:
	    this.mudaIDH(this.inc8(this.IDH()));
	    return 8;
	case 44:
	    this.mudaIDL(this.inc8(this.IDL()));
	    return 8;
	case 52: {
	    var i = this.ID_d();
	    this.pokeb(i, this.inc8(this.peekb(i)));
	    return 23;
	}
	case 37:
	    this.mudaIDH(this.dec8(this.IDH()));
	    return 8;
	case 45:
	    this.mudaIDL(this.dec8(this.IDL()));
	    return 8;
	case 53: {
	    var i = this.ID_d();
	    this.pokeb(i, this.dec8(this.peekb(i)));
	    return 23;
	}
	case 38:
	    this.mudaIDH(this.nxtpcb());
	    return 11;
	case 46:
	    mudaIDL(nxtpcb());
	    return 11;
	case 54: {
	    var i = this.ID_d();
	    this.pokeb(i, this.nxtpcb());
	    return 19;
	}
	case 68:
	    this.mudaB(this.IDH());
	    return 8;
	case 69:
	    this.mudaB(this.IDL());
	    return 8;
	case 70:
	    this.mudaB(this.peekb(this.ID_d()));
	    return 19;
	case 76:
	    this.mudaC(this.IDH());
	    return 8;
	case 77:
	    this.mudaC(this.IDL());
	    return 8;
	case 78:
	    this.mudaC(this.peekb(this.ID_d()));
	    return 19;
	case 84:
	    this.mudaD(this.IDH());
	    return 8;
	case 85:
	    this.mudaD(this.IDL());
	    return 8;
	case 86:
	    this.mudaD(this.peekb(this.ID_d()));
	    return 19;
	case 92:
	    this.mudaE(this.IDH());
	    return 8;
	case 93:
	    this.mudaE(this.IDL());
	    return 8;
	case 94:
	    this.mudaE(this.peekb(this.ID_d()));
	    return 19;
	case 96:
	    this.mudaIDH(this.B());
	    return 8;
	case 97:
	    this.mudaIDH(this.C());
	    return 8;
	case 98:
	    this.mudaIDH(this.D());
	    return 8;
	case 99:
	    this.mudaIDH(this.E());
	    return 8;
	case 100:
	    return 8;
	case 101:
	    this.mudaIDH(this.IDL());
	    return 8;
	case 102:
	    this.mudaH(this.peekb(this.ID_d()));
	    return 19;
	case 103:
	    this.mudaIDH(this.A());
	    return 8;
	case 104:
	    this.mudaIDL(this.B());
	    return 8;
	case 105:
	    this.mudaIDL(this.C());
	    return 8;
	case 106:
	    this.mudaIDL(this.D());
	    return 8;
	case 107:
	    this.mudaIDL(this.E());
	    return 8;
	case 108:
	    this.mudaIDL(this.IDH());
	    return 8;
	case 109:
	    return 8;
	case 110:
	    this.mudaL(this.peekb(this.ID_d()));
	    return 19;
	case 111:
	    this.mudaIDL(this.A());
	    return 8;
	case 112:
	    this.pokeb(this.ID_d(), this.B());
	    return 19;
	case 113:
	    this.pokeb(this.ID_d(), this.C());
	    return 19;
	case 114:
	    this.pokeb(this.ID_d(), this.D());
	    return 19;
	case 115:
	    this.pokeb(this.ID_d(), this.E());
	    return 19;
	case 116:
	    this.pokeb(this.ID_d(), this.H());
	    return 19;
	case 117:
	    this.pokeb(this.ID_d(), this.L());
	    return 19;
	case 119:
	    this.pokeb(this.ID_d(), this.A());
	    return 19;
	case 124:
	    this.mudaA(this.IDH());
	    return 8;
	case 125:
	    this.mudaA(this.IDL());
	    return 8;
	case 126:
	    this.mudaA(this.peekb(this.ID_d()));
	    return 19;
	case 132:
	    this.add_a(this.IDH());
	    return 8;
	case 133:
	    this.add_a(this.IDL());
	    return 8;
	case 134:
	    this.add_a(this.peekb(this.ID_d()));
	    return 19;
	case 140:
	    this.adc_a(this.IDH());
	    return 8;
	case 141:
	    this.adc_a(this.IDL());
	    return 8;
	case 142:
	    this.adc_a(this.peekb(this.ID_d()));
	    return 19;
	case 148:
	    this.sub_a(this.IDH());
	    return 8;
	case 149:
	    this.sub_a(this.IDL());
	    return 8;
	case 150:
	    this.sub_a(this.peekb(this.ID_d()));
	    return 19;
	case 156:
	    this.sbc_a(this.IDH());
	    return 8;
	case 157:
	    this.sbc_a(this.IDL());
	    return 8;
	case 158:
	    this.sbc_a(this.peekb(this.ID_d()));
	    return 19;
	case 164:
	    this.and_a(this.IDH());
	    return 8;
	case 165:
	    this.and_a(this.IDL());
	    return 8;
	case 166:
	    this.and_a(this.peekb(this.ID_d()));
	    return 19;
	case 172:
	    this.xor_a(this.IDH());
	    return 8;
	case 173:
	    this.xor_a(this.IDL());
	    return 8;
	case 174:
	    this.xor_a(this.peekb(this.ID_d()));
	    return 19;
	case 180:
	    this.or_a(this.IDH());
	    return 8;
	case 181:
	    this.or_a(this.IDL());
	    return 8;
	case 182:
	    this.or_a(this.peekb(this.ID_d()));
	    return 19;
	case 188:
	    this.cp_a(this.IDH());
	    return 8;
	case 189:
	    this.cp_a(this.IDL());
	    return 8;
	case 190:
	    this.cp_a(this.peekb(this.ID_d()));
	    return 19;
	case 225:
	    this.mudaID(this.popw());
	    return 14;
	case 233:
	    this.mudaPC(this.ID());
	    return 8;
	case 249:
	    this.mudaSP(this.ID());
	    return 10;
	case 203: {
	    var i = this.ID_d();
	    var i_56_ = this.nxtpcb();
	    this.execute_id_cb(i_56_, i);
	    return (i_56_ & 0xc0) == 64 ? 20 : 23;
	}
	case 227: {
	    var i = this.ID();
	    var i_57_ = this.SP();
	    this.mudaID(this.peekw(i_57_));
	    this.pokew(i_57_, i);
	    return 23;
	}
	case 229:
	    this.pushw(this.ID());
	    return 15;
	default:
	    return 0;
	}
    }

    this.execute_id_cb = function(i, i_58_) {
	switch (i) {
	case 0:
	    this.mudaB(i = this.rlc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 1:
	    this.mudaC(i = this.rlc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 2:
	    this.mudaD(i = this.rlc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 3:
	    this.mudaE(i = this.rlc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 4:
	    this.mudaH(i = this.rlc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 5:
	    this.mudaL(i = this.rlc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 6:
	    this.pokeb(i_58_, this.rlc(this.peekb(i_58_)));
	    break;
	case 7:
	    this.mudaA(i = this.rlc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 8:
	    this.mudaB(i = this.rrc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 9:
	    this.mudaC(i = this.rrc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 10:
	    this.mudaD(i = this.rrc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 11:
	    this.mudaE(i = this.rrc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 12:
	    this.mudaH(i = this.rrc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 13:
	    this.mudaL(i = this.rrc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 14:
	    this.pokeb(i_58_, this.rrc(this.peekb(i_58_)));
	    break;
	case 15:
	    this.mudaA(i = this.rrc(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 16:
	    this.mudaB(i = this.rl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 17:
	    this.mudaC(i = this.rl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 18:
	    this.mudaD(i = this.rl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 19:
	    this.mudaE(i = this.rl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 20:
	    this.mudaH(i = this.rl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 21:
	    this.mudaL(i = this.rl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 22:
	    this.pokeb(i_58_, this.rl(this.peekb(i_58_)));
	    break;
	case 23:
	    this.mudaA(i = this.rl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 24:
	    this.mudaB(i = this.rr(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 25:
	    this.mudaC(i = this.rr(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 26:
	    this.mudaD(i = this.rr(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 27:
	    this.mudaE(i = this.rr(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 28:
	    this.mudaH(i = this.rr(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 29:
	    this.mudaL(i = this.rr(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 30:
	    this.pokeb(i_58_, this.rr(this.peekb(i_58_)));
	    break;
	case 31:
	    this.mudaA(i = this.rr(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 32:
	    this.mudaB(i = this.sla(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 33:
	    this.mudaC(i = this.sla(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 34:
	    this.mudaD(i = this.sla(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 35:
	    this.mudaE(i = this.sla(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 36:
	    this.mudaH(i = this.sla(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 37:
	    this.mudaL(i = this.sla(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 38:
	    this.pokeb(i_58_, this.sla(this.peekb(i_58_)));
	    break;
	case 39:
	    this.mudaA(i = this.sla(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 40:
	    this.mudaB(i = this.sra(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 41:
	    this.mudaC(i = this.sra(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 42:
	    this.mudaD(i = this.sra(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 43:
	    this.mudaE(i = this.sra(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 44:
	    this.mudaH(i = this.sra(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 45:
	    this.mudaL(i = this.sra(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 46:
	    this.pokeb(i_58_, this.sra(this.peekb(i_58_)));
	    break;
	case 47:
	    this.mudaA(i = this.sra(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 48:
	    this.mudaB(i = this.sls(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 49:
	    this.mudaC(i = this.sls(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 50:
	    this.mudaD(i = this.sls(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 51:
	    this.mudaE(i = this.sls(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 52:
	    this.mudaH(i = this.sls(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 53:
	    this.mudaL(i = this.sls(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 54:
	    this.pokeb(i_58_, this.sls(this.peekb(i_58_)));
	    break;
	case 55:
	    this.mudaA(i = this.sls(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 56:
	    this.mudaB(i = this.srl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 57:
	    this.mudaC(i = this.srl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 58:
	    this.mudaD(i = this.srl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 59:
	    this.mudaE(i = this.srl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 60:
	    this.mudaH(i = this.srl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 61:
	    this.mudaL(i = this.srl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 62:
	    this.pokeb(i_58_, this.srl(this.peekb(i_58_)));
	    break;
	case 63:
	    this.mudaA(i = this.srl(this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 64:
	case 65:
	case 66:
	case 67:
	case 68:
	case 69:
	case 70:
	case 71:
	    this.bit(1, this.peekb(i_58_));
	    break;
	case 72:
	case 73:
	case 74:
	case 75:
	case 76:
	case 77:
	case 78:
	case 79:
	    this.bit(2, this.peekb(i_58_));
	    break;
	case 80:
	case 81:
	case 82:
	case 83:
	case 84:
	case 85:
	case 86:
	case 87:
	    this.bit(4, this.peekb(i_58_));
	    break;
	case 88:
	case 89:
	case 90:
	case 91:
	case 92:
	case 93:
	case 94:
	case 95:
	    this.bit(8, this.peekb(i_58_));
	    break;
	case 96:
	case 97:
	case 98:
	case 99:
	case 100:
	case 101:
	case 102:
	case 103:
	    this.bit(16, this.peekb(i_58_));
	    break;
	case 104:
	case 105:
	case 106:
	case 107:
	case 108:
	case 109:
	case 110:
	case 111:
	    this.bit(32, this.peekb(i_58_));
	    break;
	case 112:
	case 113:
	case 114:
	case 115:
	case 116:
	case 117:
	case 118:
	case 119:
	    this.bit(64, this.peekb(i_58_));
	    break;
	case 120:
	case 121:
	case 122:
	case 123:
	case 124:
	case 125:
	case 126:
	case 127:
	    this.bit(128, this.peekb(i_58_));
	    break;
	case 128:
	    this.mudaB(i = this.res(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 129:
	    this.mudaC(i = this.res(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 130:
	    this.mudaD(i = this.res(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 131:
	    this.mudaE(i = this.res(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 132:
	    this.mudaH(i = this.res(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 133:
	    this.mudaL(i = this.res(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 134:
	    this.pokeb(i_58_, this.res(1, this.peekb(i_58_)));
	    break;
	case 135:
	    this.mudaA(i = this.res(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 136:
	    this.mudaB(i = this.res(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 137:
	    this.mudaC(i = this.res(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 138:
	    this.mudaD(i = this.res(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 139:
	    this.mudaE(i = this.res(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 140:
	    this.mudaH(i = this.res(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 141:
	    this.mudaL(i = this.res(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 142:
	    this.pokeb(i_58_, this.res(2, this.peekb(i_58_)));
	    break;
	case 143:
	    this.mudaA(i = this.res(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 144:
	    this.mudaB(i = this.res(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 145:
	    this.mudaC(i = this.res(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 146:
	    this.mudaD(i = this.res(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 147:
	    this.mudaE(i = this.res(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 148:
	    this.mudaH(i = this.res(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 149:
	    this.mudaL(i = this.res(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 150:
	    this.pokeb(i_58_, this.res(4, this.peekb(i_58_)));
	    break;
	case 151:
	    this.mudaA(i = this.res(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 152:
	    this.mudaB(i = this.res(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 153:
	    this.mudaC(i = this.res(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 154:
	    this.mudaD(i = this.res(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 155:
	    this.mudaE(i = this.res(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 156:
	    this.mudaH(i = this.res(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 157:
	    this.mudaL(i = this.res(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 158:
	    this.pokeb(i_58_, this.res(8, this.peekb(i_58_)));
	    break;
	case 159:
	    this.mudaA(i = this.res(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 160:
	    this.mudaB(i = this.res(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 161:
	    this.mudaC(i = this.res(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 162:
	    this.mudaD(i = this.res(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 163:
	    this.mudaE(i = this.res(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 164:
	    this.mudaH(i = this.res(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 165:
	    this.mudaL(i = this.res(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 166:
	    this.pokeb(i_58_, this.res(16, this.peekb(i_58_)));
	    break;
	case 167:
	    this.mudaA(i = this.res(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 168:
	    this.mudaB(i = this.res(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 169:
	    this.mudaC(i = this.res(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 170:
	    this.mudaD(i = this.res(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 171:
	    this.mudaE(i = this.res(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 172:
	    this.mudaH(i = this.res(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 173:
	    this.mudaL(i = this.res(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 174:
	    this.pokeb(i_58_, this.res(32, this.peekb(i_58_)));
	    break;
	case 175:
	    this.mudaA(i = this.res(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 176:
	    this.mudaB(i = this.res(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 177:
	    this.mudaC(i = this.res(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 178:
	    this.mudaD(i = this.res(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 179:
	    this.mudaE(i = this.res(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 180:
	    this.mudaH(i = this.res(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 181:
	    this.mudaL(i = this.res(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 182:
	    this.pokeb(i_58_, this.res(64, this.peekb(i_58_)));
	    break;
	case 183:
	    this.mudaA(i = this.res(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 184:
	    this.mudaB(i = this.res(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 185:
	    this.mudaC(i = this.res(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 186:
	    this.mudaD(i = this.res(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 187:
	    this.mudaE(i = this.res(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 188:
	    this.mudaH(i = this.res(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 189:
	    this.mudaL(i = this.res(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 190:
	    this.pokeb(i_58_, this.res(128, this.peekb(i_58_)));
	    break;
	case 191:
	    this.mudaA(i = this.res(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 192:
	    this.mudaB(i = this.set(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 193:
	    this.mudaC(i = this.set(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 194:
	    this.mudaD(i = this.set(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 195:
	    this.mudaE(i = this.set(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 196:
	    this.mudaH(i = this.set(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 197:
	    this.mudaL(i = this.set(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 198:
	    this.pokeb(i_58_, this.set(1, this.peekb(i_58_)));
	    break;
	case 199:
	    this.mudaA(i = this.set(1, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 200:
	    this.mudaB(i = this.set(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 201:
	    this.mudaC(i = this.set(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 202:
	    this.mudaD(i = this.set(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 203:
	    this.mudaE(i = this.set(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 204:
	    this.mudaH(i = this.set(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 205:
	    this.mudaL(i = this.set(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 206:
	    this.pokeb(i_58_, this.set(2, this.peekb(i_58_)));
	    break;
	case 207:
	    this.mudaA(i = this.set(2, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 208:
	    this.mudaB(i = this.set(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 209:
	    this.mudaC(i = this.set(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 210:
	    this.mudaD(i = this.set(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 211:
	    this.mudaE(i = this.set(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 212:
	    this.mudaH(i = this.set(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 213:
	    this.mudaL(i = this.set(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 214:
	    this.pokeb(i_58_, this.set(4, this.peekb(i_58_)));
	    break;
	case 215:
	    this.mudaA(i = this.set(4, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 216:
	    this.mudaB(i = this.set(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 217:
	    this.mudaC(i = this.set(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 218:
	    this.mudaD(i = this.set(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 219:
	    this.mudaE(i = this.set(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 220:
	    this.mudaH(i = this.set(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 221:
	    this.mudaL(i = this.set(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 222:
	    this.pokeb(i_58_, this.set(8, this.peekb(i_58_)));
	    break;
	case 223:
	    this.mudaA(i = this.set(8, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 224:
	    this.mudaB(i = this.set(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 225:
	    this.mudaC(i = this.set(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 226:
	    this.mudaD(i = this.set(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 227:
	    this.mudaE(i = this.set(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 228:
	    this.mudaH(i = this.set(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 229:
	    this.mudaL(i = this.set(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 230:
	    this.pokeb(i_58_, this.set(16, this.peekb(i_58_)));
	    break;
	case 231:
	    this.mudaA(i = this.set(16, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 232:
	    this.mudaB(i = this.set(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 233:
	    this.mudaC(i = this.set(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 234:
	    this.mudaD(i = this.set(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 235:
	    this.mudaE(i = this.set(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 236:
	    this.mudaH(i = this.set(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 237:
	    this.mudaL(i = this.set(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 238:
	    this.pokeb(i_58_, this.set(32, this.peekb(i_58_)));
	    break;
	case 239:
	    this.mudaA(i = this.set(32, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 240:
	    this.mudaB(i = this.set(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 241:
	    this.mudaC(i = this.set(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 242:
	    this.mudaD(i = this.set(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 243:
	    this.mudaE(i = this.set(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 244:
	    this.mudaH(i = this.set(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 245:
	    this.mudaL(i = this.set(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 246:
	    this.pokeb(i_58_, this.set(64, this.peekb(i_58_)));
	    break;
	case 247:
	    this.mudaA(i = this.set(64, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 248:
	    this.mudaB(i = this.set(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 249:
	    this.mudaC(i = this.set(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 250:
	    this.mudaD(i = this.set(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 251:
	    this.mudaE(i = this.set(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 252:
	    this.mudaH(i = this.set(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 253:
	    this.mudaL(i = this.set(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	case 254:
	    this.pokeb(i_58_, this.set(128, this.peekb(i_58_)));
	    break;
	case 255:
	    this.mudaA(i = this.set(128, this.peekb(i_58_)));
	    this.pokeb(i_58_, i);
	    break;
	}
    }        

    this.exx = function() {
	var i = this.HL();
	this.mudaHL(this._HL_);
	this._HL_ = i;
	i = this.DE();
	this.mudaDE(this._DE_);
	this._DE_ = i;
	i = this.BC();
	this.mudaBC(this._BC_);
	this._BC_ = i;
    }
    
    this.in_bc = function() {
	var i = this.inb(this.C());
	this.setZ(i == 0);
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setPV(this.parity[i]);
	this.setN(false);
	this.setH(false);
	return i;
    }
    
    this.inb = function(i) {
	this.println("inb do Z80");
	return 255;
    }
    
    this.inc16 = function(i) {
	return i + 1 & 0xffff;
    }
    
    this.inc8 = function(i) {
	var bool = i == 127;
	var bool_59_ = ((i & 0xf) + 1 & 0x10) != 0;
	i = i + 1 & 0xff;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(bool);
	this.setH(bool_59_);
	this.setN(false);
	return i;
    }
    
    this.z80_interrupt = function() {
//	return 0;// remove me - z80 interrupt disabled for debug

	if (!this.IFF1())
	    return 0;
	switch (this.IM()) {
	case 0:
	case 1:
	    this.pushpc();
	    this.mudaIFF1(false);
	    this.mudaIFF2(false);
	    this.mudaPC(56);
	    return 13;
	case 2: {
	    this.pushpc();
	    this.mudaIFF1(false);
	    this.mudaIFF2(false);
	    var i = this.I() << 8 | 0xff;
	    this.mudaPC(this.peekw(i));
	    return 19;
	}
	default:
	    return 0;
	}
    }
    
    this.interruptTriggered = function(i) {
	return (i >= 0);
    }
    
    this.ld_a_i = function() {
	var i = this.I();
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.IFF2());
	this.setH(false);
	this.setN(false);
	this.mudaA(i);
    }
    
    this.ld_a_r = function() {
	var i = this.R();
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.IFF2());
	this.setH(false);
	this.setN(false);
	this.mudaA(i);
    }
    
    this.mudaA = function(i) {
	this._A = i & 0xff;
    }
    
    this.mudaAF = function(i) {
	this.mudaA(i >> 8);
	this.mudaF(i & 0xff);
    }
    
    this.mudaB = function(i) {
	this._B = i & 0xff;
    }
    
    this.mudaBC = function(i) {
	this.mudaB(i >> 8);
	this.mudaC(i & 0xff);
    }
    
    this.mudaC = function(i) {
	this._C = i & 0xff;
    }
    
    this.mudaD = function(i) {
	this._DE = i << 8 & 0xff00 | this._DE & 0xff;
    }
    
    this.mudaDE = function(i) {
	this._DE = i;
    }
    
    this.mudaE = function(i) {
	this._DE = this._DE & 0xff00 | i & 0xff;
    }
    
    this.mudaF = function(i) {
	this.fS = (i & 0x80) != 0;
	this.fZ = (i & 0x40) != 0;
	this.f5 = (i & 0x20) != 0;
	this.fH = (i & 0x10) != 0;
	this.f3 = (i & 0x8) != 0;
	this.fPV = (i & 0x4) != 0;
	this.fN = (i & 0x2) != 0;
	this.fC = (i & 0x1) != 0;
    }
    
    this.mudaH = function(i) {
	this._HL = i << 8 & 0xff00 | this._HL & 0xff;
    }
    
    this.mudaHL = function(i) {
	this._HL = i;
    }
    
    this.mudaI = function(i) {
	this._I = i;
    }
    
    this.mudaID = function(i) {
	this._ID = i;
    }
    
    this.mudaIDH = function(i) {
	this._ID = i << 8 & 0xff00 | this._ID & 0xff;
    }
    
    this.mudaIDL = function(i) {
	this._ID = this._ID & 0xff00 | i & 0xff;
    }
    
    this.mudaIFF1 = function(bool) {
	this._IFF1 = bool;
    }
    
    this.mudaIFF2 = function(bool) {
	this._IFF2 = bool;
    }
    
    this.mudaIM = function(i) {
	this._IM = i;
    }
    
    this.mudaIX = function(i) {
	this._IX = i;
    }
    
    this.mudaIY = function(i) {
	this._IY = i;
    }
    
    this.mudaL = function(i) {
	this._HL = this._HL & 0xff00 | i & 0xff;
    }
    
    this.mudaPC = function(i) {
	this._PC = i;
    }
    
    this.mudaR = function(i) {
	this._R = i;
	this._R7 = i & 0x80;
    }
    
    this.mudaSP = function(i) {
	this._SP = i;
    }
    
    this.neg_a = function() {
	var i = this.A();
	this.mudaA(0);
	this.sub_a(i);
    }
    
    this.nxtpcb = function() {
	var i = this.PC();
	var i_60_ = this.peekb(i);
	this.mudaPC(++i & 0xffff);
	return i_60_;
    }
    
    this.nxtpcw = function() {
	var i = this.PC();
	var i_61_ = this.peekb(i);
	i_61_ |= this.peekb(++i & 0xffff) << 8;
	this.mudaPC(++i & 0xffff);
	return i_61_;
    }
    
    this.or_a = function(i) {
	var i_62_ = this.A() | i;
	this.setS((i_62_ & 0x80) != 0);
	this.set3((i_62_ & 0x8) != 0);
	this.set5((i_62_ & 0x20) != 0);
	this.setH(false);
	this.setPV(this.parity[i_62_]);
	this.setZ(i_62_ == 0);
	this.setN(false);
	this.setC(false);
	this.mudaA(i_62_);
    }
    
    this.outb = function(i, i_63_, i_64_) {
	/* empty */
    }
    
    this.peekb = function(i) {
	return 0;
    }
    
    this.peekw = function(i) {
	return 0;
    }
    
    this.pokeb = function(i, i_65_) {
	/* empty */
    }
    
    this.pokew = function(i, i_66_) {
	/* empty */
    }
    
    this.poppc = function() {
	this.mudaPC(this.popw());
    }
    
    this.popw = function() {
	var i = this.SP();
	var i_67_ = this.peekw(i++);
	this.mudaSP(++i & 0xffff);
	return i_67_;
    }
    
    this.printHex = function(i) {
	for (var i_68_ = 1; i_68_ >= 0; i_68_--) {
	    var i_69_ = i >> i_68_ * 4 & 0xf;
	    switch (i_69_) {
	    case 10:
		System.out.print("a");
		break;
	    case 11:
		System.out.print("b");
		break;
	    case 12:
		System.out.print("c");
		break;
	    case 13:
		System.out.print("d");
		break;
	    case 14:
		System.out.print("e");
		break;
	    case 15:
		System.out.print("f");
		break;
	    case 0:
		System.out.print("0");
		break;
	    case 1:
		System.out.print("1");
		break;
	    case 2:
		System.out.print("2");
		break;
	    case 3:
		System.out.print("3");
		break;
	    case 4:
		System.out.print("4");
		break;
	    case 5:
		System.out.print("5");
		break;
	    case 6:
		System.out.print("6");
		break;
	    case 7:
		System.out.print("7");
		break;
	    case 8:
		System.out.print("8");
		break;
	    case 9:
		System.out.print("9");
		break;
	    }
	}
    }
    
    this.pushpc = function() {
	this.pushw(this.PC());
    }
    
    this.pushw = function(i) {
	var i_70_ = this.SP() - 2 & 0xffff;
	this.mudaSP(i_70_);
	this.pokew(i_70_, i);
    }
    
    this.qdec8 = function(i) {
	return i - 1 & 0xff;
    }
    
    this.qinc8 = function(i) {
	return i + 1 & 0xff;
    }
    
    this.res = function(i, i_71_) {
	return i_71_ & (i ^ 0xffffffff);
    }
    
    this.reset = function() {
	this.mudaPC(0);
	this.mudaSP(65520);
	this.mudaA(0);
	this.mudaF(0);
	this.mudaBC(0);
	this.mudaDE(0);
	this.mudaHL(0);
	this.exx();
	this.ex_af_af();
	this.mudaA(0);
	this.mudaF(0);
	this.mudaBC(0);
	this.mudaDE(0);
	this.mudaHL(0);
	this.mudaIX(0);
	this.mudaIY(0);
	this.mudaR(0);
	this.mudaI(0);
	this.mudaIFF1(false);
	this.mudaIFF2(false);
	this.mudaIM(0);
    }
    
    this.retornaHex = function(i) {
	string = "";
	for (var i_72_ = 1; i_72_ >= 0; i_72_--) {
	    var i_73_ = i >> i_72_ * 4 & 0xf;
	    switch (i_73_) {
	    case 10:
		string += "a";
		break;
	    case 11:
		string += "b";
		break;
	    case 12:
		string += "c";
		break;
	    case 13:
		string += "d";
		break;
	    case 14:
		string += "e";
		break;
	    case 15:
		string += "f";
		break;
	    case 0:
		string += "0";
		break;
	    case 1:
		string += "1";
		break;
	    case 2:
		string += "2";
		break;
	    case 3:
		string += "3";
		break;
	    case 4:
		string += "4";
		break;
	    case 5:
		string += "5";
		break;
	    case 6:
		string += "6";
		break;
	    case 7:
		string += "7";
		break;
	    case 8:
		string += "8";
		break;
	    case 9:
		string += "9";
		break;
	    }
	}
	return string;
    }
    
    this.retornaInst = function(i) {
	switch (i) {
	case 0:
	    return "NOP";
	case 8:
	    return "EX AF,AF'";
	case 16:
	    return "DJNZ dis";
	case 24:
	    return "JR dis";
	case 32:
	    return "JR NZ,dis";
	case 40:
	    return "JR Z,dis";
	case 48:
	    return "JR NC,dis";
	case 56:
	    return "JR C,dis";
	case 1:
	    return "LD BC,nn";
	case 9:
	    return "ADD HL,BC";
	case 17:
	    return "LD DE,nn";
	case 25:
	    return "ADD HL,DE";
	case 33:
	    return "LD HL,nn";
	case 41:
	    return "ADD HL,HL";
	case 49:
	    return "LD SP,nn";
	case 57:
	    return "ADD HL,SP";
	case 2:
	    return "LD (BC),A";
	case 10:
	    return "LD A,(BC)";
	case 18:
	    return "LD (DE),A";
	case 26:
	    return "LD A,(BC)";
	case 34:
	    return "LD (nn),HL";
	case 42:
	    return "LD HL,(nn)";
	case 50:
	    return "LD (nn),A";
	case 58:
	    return "LD A,(nn)";
	case 3:
	    return "INC BC";
	case 11:
	    return "DEC BC";
	case 19:
	    return "INC DE";
	case 27:
	    return "DEC BC";
	case 35:
	    return "INC HL";
	case 43:
	    return "DEC HL";
	case 51:
	    return "INC SP";
	case 59:
	    return "DEC SP";
	case 4:
	    return "INC B";
	case 12:
	    return "INC C";
	case 20:
	    return "INC D";
	case 28:
	    return "INC E";
	case 36:
	    return "INC H";
	case 44:
	    return "INC L";
	case 52:
	    return "INC (HL)";
	case 60:
	    return "INC A";
	case 5:
	    return "DEC B";
	case 13:
	    return "DEC C";
	case 21:
	    return "DEC D";
	case 29:
	    return "DEC E";
	case 37:
	    return "DEC H";
	case 45:
	    return "DEC L";
	case 53:
	    return "DEC (HL)";
	case 61:
	    return "DEC A";
	case 6:
	    return "LD B,n";
	case 14:
	    return "LD C,n";
	case 22:
	    return "LD D,n";
	case 30:
	    return "LD E,n";
	case 38:
	    return "LD H,n";
	case 46:
	    return "LD L,n";
	case 54:
	    return "LD (HL),n";
	case 62:
	    return "LD A,n";
	case 7:
	    return "RLCA";
	case 15:
	    return "RRCA";
	case 23:
	    return "RLA";
	case 31:
	    return "RRA";
	case 39:
	    return "DAA";
	case 47:
	    return "CPL";
	case 55:
	    return "SCF";
	case 63:
	    return "CCF";
	case 64:
	    return "LD B,B";
	case 65:
	    return "LD B,C";
	case 66:
	    return "LD B,D";
	case 67:
	    return "LD B,D";
	case 68:
	    return "LD B,H";
	case 69:
	    return "LD B,L";
	case 70:
	    return "LD B,(HL)";
	case 71:
	    return "LD B,A";
	case 72:
	    return "LD C,B";
	case 73:
	    return "LD C,C";
	case 74:
	    return "LD C,D";
	case 75:
	    return "LD C,E";
	case 76:
	    return "LD C,H";
	case 77:
	    return "LD C,L";
	case 78:
	    return "LD C,(HL)";
	case 79:
	    return "LD C,A";
	case 80:
	    return "LD D,B";
	case 81:
	    return "LD D,C";
	case 82:
	    return "LD D,D";
	case 83:
	    return "LD D,E";
	case 84:
	    return "LD D,H";
	case 85:
	    return "LD D,L";
	case 86:
	    return "LD D,(HL)";
	case 87:
	    return "LD D,A";
	case 88:
	    return "LD E,B";
	case 89:
	    return "LD E,C";
	case 90:
	    return "LD E,D";
	case 91:
	    return "LD E,E";
	case 92:
	    return "LD E,H";
	case 93:
	    return "LD E,L";
	case 94:
	    return "LD E,(HL)";
	case 95:
	    return "LD E,A";
	case 96:
	    return "LD H,B";
	case 97:
	    return "LD H,C";
	case 98:
	    return "LD H,D";
	case 99:
	    return "LD H,E";
	case 100:
	    return "LD H,H";
	case 101:
	    return "LD H,L";
	case 102:
	    return "LD H,(HL)";
	case 103:
	    return "LD H,A";
	case 104:
	    return "LD L,B";
	case 105:
	    return "LD L,C";
	case 106:
	    return "LD L,D";
	case 107:
	    return "LD L,E";
	case 108:
	    return "LD L,H";
	case 109:
	    return "LD L,L";
	case 110:
	    return "LD L,(HL)";
	case 111:
	    return "LD L,A";
	case 112:
	    return "LD (HL),B";
	case 113:
	    return "LD (HL),C";
	case 114:
	    return "LD (HL),D";
	case 115:
	    return "LD (HL),E";
	case 116:
	    return "LD (HL),H";
	case 117:
	    return "LD (HL),L";
	case 118:
	    return "HALT";
	case 119:
	    return "LD (HL),A";
	case 120:
	    return "LD A,B";
	case 121:
	    return "LD A,C";
	case 122:
	    return "LD A,D";
	case 123:
	    return "LD A,E";
	case 124:
	    return "LD A,H";
	case 125:
	    return "LD A,L";
	case 126:
	    return "LD A,(HL)";
	case 127:
	    return "LD A,A";
	case 128:
	    return "ADD A,B";
	case 129:
	    return "ADD A,C";
	case 130:
	    return "ADD A,D";
	case 131:
	    return "ADD A,E";
	case 132:
	    return "ADD A,H";
	case 133:
	    return "ADD A,L";
	case 134:
	    return "ADD A,(HL)";
	case 135:
	    return "ADD A,A";
	case 136:
	    return "ADC A,B";
	case 137:
	    return "ADC A,C";
	case 138:
	    return "ADC A,D";
	case 139:
	    return "ADC A,E";
	case 140:
	    return "ADC A,H";
	case 141:
	    return "ADC A,L";
	case 142:
	    return "ADC A,(HL)";
	case 143:
	    return "ADC A,A";
	case 144:
	    return "SUB B";
	case 145:
	    return "SUB C";
	case 146:
	    return "SUB D";
	case 147:
	    return "SUB E";
	case 148:
	    return "SUB H";
	case 149:
	    return "SUB L";
	case 150:
	    return "SUB (HL)";
	case 151:
	    return "SUB A";
	case 152:
	    return "SBC A,B";
	case 153:
	    return "SBC A,C";
	case 154:
	    return "SBC A,D";
	case 155:
	    return "SBC A,E";
	case 156:
	    return "SBC A,H";
	case 157:
	    return "SBC A,L";
	case 158:
	    return "SBC A,(HL)";
	case 159:
	    return "SBC A,A";
	case 160:
	    return "AND B";
	case 161:
	    return "AND C";
	case 162:
	    return "AND D";
	case 163:
	    return "AND E";
	case 164:
	    return "AND H";
	case 165:
	    return "AND L";
	case 166:
	    return "AND (HL)";
	case 167:
	    return "AND A";
	case 168:
	    return "XOR B";
	case 169:
	    return "XOR C";
	case 170:
	    return "XOR D";
	case 171:
	    return "XOR E";
	case 172:
	    return "XOR H";
	case 173:
	    return "XOR L";
	case 174:
	    return "XOR (HL)";
	case 175:
	    return "XOR A";
	case 176:
	    return "OR B";
	case 177:
	    return "OR C";
	case 178:
	    return "OR D";
	case 179:
	    return "OR E";
	case 180:
	    return "OR H";
	case 181:
	    return "OR L";
	case 182:
	    return "OR (HL)";
	case 183:
	    return "OR A";
	case 184:
	    return "CP B";
	case 185:
	    return "CP C";
	case 186:
	    return "CP D";
	case 187:
	    return "CP E";
	case 188:
	    return "CP H";
	case 189:
	    return "CP L";
	case 190:
	    return "CP (HL)";
	case 191:
	    return "CP A";
	case 192:
	    return "RET NZ";
	case 200:
	    return "RET Z";
	case 208:
	    return "RET NC";
	case 216:
	    return "RET C";
	case 224:
	    return "RET PO";
	case 232:
	    return "RET PE";
	case 240:
	    return "RET P";
	case 248:
	    return "RET M";
	case 193:
	    return "POP BC";
	case 201:
	    return "RET";
	case 209:
	    return "POP DE";
	case 217:
	    return "EXX";
	case 225:
	    return "POP HL";
	case 233:
	    return "JP (HL)";
	case 241:
	    return "POP AF";
	case 249:
	    return "LD SP,HL";
	case 194:
	    return "JP NZ,nn";
	case 202:
	    return "JP Z,nn";
	case 210:
	    return "JP NC,nn";
	case 218:
	    return "JP C,nn";
	case 226:
	    return "JP PO,nn";
	case 234:
	    return "JP PE,nn";
	case 242:
	    return "JP P,nn";
	case 250:
	    return "JP M,nn";
	case 195:
	    return "JP nn";
	case 203:
	    return "prefixo CB";
	case 211:
	    return "OUT (n),A";
	case 219:
	    return "IN A,(n)";
	case 227:
	    return "EX (SP),HL";
	case 235:
	    return "EX DE,HL";
	case 243:
	    return "DI";
	case 251:
	    return "EI";
	case 196:
	    return "CALL NZ,nn";
	case 204:
	    return "CALL Z,nn";
	case 212:
	    return "CALL NC,nn";
	case 220:
	    return "CALL C,nn";
	case 228:
	    return "CALL PO,nn";
	case 236:
	    return "CALL PE,nn";
	case 244:
	    return "CALL P,nn";
	case 252:
	    return "CALL M,nn";
	case 197:
	    return "PUSH BC";
	case 205:
	    return "CALL nn";
	case 213:
	    return "PUSH DE";
	case 221:
	    return "Prefixo IX";
	case 229:
	    return "PUSH HL";
	case 237:
	    return "Prefixo ED";
	case 245:
	    return "PUSH AF";
	case 253:
	    return "Prefixo IY";
	case 198:
	    return "ADD nn";
	case 206:
	    return "ADC nn";
	case 214:
	    return "SUB nn";
	case 222:
	    return "SBC nn";
	case 230:
	    return "AND nn";
	case 238:
	    return "XOR nn";
	case 246:
	    return "OR nn";
	case 254:
	    return "CP nn";
	case 199:
	    return "RST 0";
	case 207:
	    return "RST 8";
	case 215:
	    return "RST 16";
	case 223:
	    return "RST 24";
	case 231:
	    return "RST 32";
	case 239:
	    return "RST 40";
	case 247:
	    return "RST 48";
	case 255:
	    return "RST 56";
	default:
	    return "Instrucao nao catalogada " + retornaHex(i);
	}
    }
    
    this.rl = function(i) {
	var bool = (i & 0x80) != 0;
	if (this.Cset())
	    i = i << 1 | 0x1;
	else
	    i <<= 1;
	i &= 0xff;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.rl_a = function() {
	var i = this.A();
	var bool = (i & 0x80) != 0;
	if (this.Cset())
	    i = i << 1 | 0x1;
	else
	    i <<= 1;
	i &= 0xff;
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setN(false);
	this.setH(false);
	this.setC(bool);
	this.mudaA(i);
    }
    
    this.rlc = function(i) {
	var bool = (i & 0x80) != 0;
	if (bool)
	    i = i << 1 | 0x1;
	else
	    i <<= 1;
	i &= 0xff;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.rlc_a = function() {
	var i = this.A();
	var bool = (i & 0x80) != 0;
	if (bool)
	    i = i << 1 | 0x1;
	else
	    i <<= 1;
	i &= 0xff;
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setN(false);
	this.setH(false);
	this.setC(bool);
	this.mudaA(i);
    }
    
    this.rld_a = function() {
	var i = this.A();
	var i_74_ = this.peekb(this.HL());
	var i_75_ = i_74_;
	i_74_ = i_74_ << 4 | i & 0xf;
	i = i & 0xf0 | i_75_ >> 4;
	this.pokeb(this.HL(), i_74_ & 0xff);
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.mudaA(i);
    }
    
    this.rr = function(i) {
	var bool = (i & 0x1) != 0;
	if (this.Cset())
	    i = i >> 1 | 0x80;
	else
	    i >>= 1;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.rr_a = function() {
	var i = this.A();
	var bool = (i & 0x1) != 0;
	if (this.Cset())
	    i = i >> 1 | 0x80;
	else
	    i >>= 1;
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setN(false);
	this.setH(false);
	this.setC(bool);
	this.mudaA(i);
    }
    
    this.rrc = function(i) {
	var bool = (i & 0x1) != 0;
	if (bool)
	    i = i >> 1 | 0x80;
	else
	    i >>= 1;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.rrc_a = function() {
	var i = this.A();
	var bool = (i & 0x1) != 0;
	if (bool)
	    i = i >> 1 | 0x80;
	else
	    i >>= 1;
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setN(false);
	this.setH(false);
	this.setC(bool);
	this.mudaA(i);
    }
    
    this.rrd_a = function() {
	var i = this.A();
	var i_76_ = this.peekb(this.HL());
	var i_77_ = i_76_;
	var i_76_ = i_76_ >> 4 | i << 4;
	i = i & 0xf0 | i_77_ & 0xf;
	this.pokeb(this.HL(), i_76_);
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.mudaA(i);
    }
    
    this.sbc16 = function(i, i_78_) {
	var i_79_ = this.Cset() ? 1 : 0;
	var i_80_ = i - i_78_ - i_79_;
	var i_81_ = i_80_ & 0xffff;
	this.setS((i_81_ & 0x8000) != 0);
	this.set3((i_81_ & 0x800) != 0);
	this.set5((i_81_ & 0x2000) != 0);
	this.setZ(i_81_ == 0);
	this.setC((i_80_ & 0x10000) != 0);
	this.setPV(((i ^ i_78_) & (i ^ i_81_) & 0x8000) != 0);
	this.setH(((i & 0xfff) - (i_78_ & 0xfff) - i_79_ & 0x1000) != 0);
	this.setN(true);
	return i_81_;
    }
    
    this.sbc_a = function(i) {
	var i_82_ = this.A();
	var i_83_ = this.Cset() ? 1 : 0;
	var i_84_ = i_82_ - i - i_83_;
	var i_85_ = i_84_ & 0xff;
	this.setS((i_85_ & 0x80) != 0);
	this.set3((i_85_ & 0x8) != 0);
	this.set5((i_85_ & 0x20) != 0);
	this.setZ(i_85_ == 0);
	this.setC((i_84_ & 0x100) != 0);
	this.setPV(((i_82_ ^ i) & (i_82_ ^ i_85_) & 0x80) != 0);
	this.setH(((i_82_ & 0xf) - (i & 0xf) - i_83_ & 0x10) != 0);
	this.setN(true);
	this.mudaA(i_85_);
    }
    
    this.scf = function() {
	var i = this.A();
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setN(false);
	this.setH(false);
	this.setC(true);
    }
    
    this.set = function(i, i_86_) {
	return i_86_ | i;
    }
    
    this.set3 = function(bool) {
	this.f3 = bool;
    }
    
    this.set5 = function(bool) {
	this.f5 = bool;
    }
    
    this.setC = function(bool) {
	this.fC = bool;
    }
    
    this.setH = function(bool) {
	this.fH = bool;
    }
    
    this.setN = function(bool) {
	this.fN = bool;
    }
    
    this.setPV = function(bool) {
	this.fPV = bool;
    }
    
    this.setS = function(bool) {
	this.fS = bool;
    }
    
    this.setZ = function(bool) {
	this.fZ = bool;
    }
    
    this.sla = function(i) {
	var bool = (i & 0x80) != 0;
	i = i << 1 & 0xff;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.sls = function(i) {
	var bool = (i & 0x80) != 0;
	i = (i << 1 | 0x1) & 0xff;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.sra = function(i) {
	var bool = (i & 0x1) != 0;
	i = i >> 1 | i & 0x80;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.srl = function(i) {
	var bool = (i & 0x1) != 0;
	i >>= 1;
	this.setS((i & 0x80) != 0);
	this.set3((i & 0x8) != 0);
	this.set5((i & 0x20) != 0);
	this.setZ(i == 0);
	this.setPV(this.parity[i]);
	this.setH(false);
	this.setN(false);
	this.setC(bool);
	return i;
    }
    
    this.sub_a = function(i) {
	var i_87_ = this.A();
	var i_88_ = i_87_ - i;
	var i_89_ = i_88_ & 0xff;
	this.setS((i_89_ & 0x80) != 0);
	this.set3((i_89_ & 0x8) != 0);
	this.set5((i_89_ & 0x20) != 0);
	this.setZ(i_89_ == 0);
	this.setC((i_88_ & 0x100) != 0);
	this.setPV(((i_87_ ^ i) & (i_87_ ^ i_89_) & 0x80) != 0);
	this.setH(((i_87_ & 0xf) - (i & 0xf) & 0x10) != 0);
	this.setN(true);
	this.mudaA(i_89_);
    }
    
    this.xor_a = function(i) {
	var i_90_ = (this.A() ^ i) & 0xff;
	this.setS((i_90_ & 0x80) != 0);
	this.set3((i_90_ & 0x8) != 0);
	this.set5((i_90_ & 0x20) != 0);
	this.setH(false);
	this.setPV(this.parity[i_90_]);
	this.setZ(i_90_ == 0);
	this.setN(false);
	this.setC(false);
	this.mudaA(i_90_);
    }
}
