/*

���L�������֘A

*/

#pragma once
#include <windows.h>

class Memory_M
{

public:

    //���L�������T�C�Y
    char* Mname = (char*)"name";//���O
    DWORD MemorySize = 100;//�T�C�Y
    HANDLE Mhandle = NULL;//�n���h��
    void* p = NULL;//���蓖�ă������̃|�C���^


    //���L�������쐬�ƃ}�b�s���O
    bool MemoryCreate() {

        //���L�������쐬
        Mhandle = CreateFileMappingA(
            INVALID_HANDLE_VALUE//���L�������̏ꍇ�́A0xffffffff(INVALID_HANDLE_VALUE)�ŌŒ�
            , NULL// SECURITY_ATTRIBUTES�\����(�Z�L�����e�B�֘A�炵���A
            , PAGE_READWRITE//�ی쑮��(����͓ǂݏ���������
            , 0//�������̍ŏ��T�C�Y
            , MemorySize//�ő�T�C�Y
            , Mname//���L�������̖��O
        );
        if (NULL == Mhandle) {
            //MessageBox(NULL, "���L�������쐬���s�`", "a", MB_OK);
            return false;
        }

        //���L�������}�b�s���O
        p = MapViewOfFile(
            Mhandle//�n���h��
            , FILE_MAP_WRITE//�ی쑮��(����͓ǂݏ���������
            , 0//�I�t�Z�b�g
            , 0//�I�t�Z�b�g
            , MemorySize//�T�C�Y
        );
        if (p == NULL) {
            //MessageBox(NULL, "���L�������}�b�s���O���s�`", "a", MB_OK);
            return false;
        }

        return true;
    }

    //���L�������폜
    void Memorydelete() {
        if (p != NULL) {// ���L�}�b�s���O�̉���
            UnmapViewOfFile(p);
            p = NULL;
        }
        if (Mhandle != NULL) {// �t�@�C���}�b�s���O�I�u�W�F�N�g�n���h���̉��
            CloseHandle(Mhandle);
            Mhandle = NULL;
        }
    }

    ~Memory_M() {
        Memorydelete();
    }

};